import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getPineconeClient } from '@/lib/pinecone'
import { generateEmbedding, getChatCompletionStream } from '@/lib/openai'
import { formatAnalyticsData } from '@/lib/chat-analytics'

// Using Node.js runtime for Pinecone compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are a helpful assistant for OhioMeansJobs Erie County. You help users with:
- Job seeker services (resume writing, interview prep, job search assistance)
- Employer services (job posting, recruitment, training grants)
- Youth programs (L.Y.F.E. program for ages 16-24)
- Events and workshops information
- Contact information and office hours

Be friendly, professional, and provide accurate information. If you don't know something, direct users to contact the office directly.

Office Information:
- Address: 221 W. Parish St., Sandusky, OH 44870
- Phone: 419-624-6451
- Appointments: 419-624-6459
- Email: OMJ-ErieCo@jfs.ohio.gov
- Hours: Monday-Friday, 8:30 AM - 4:00 PM

**CRITICAL - Downloadable Documents:**
When you have access to downloadable documents in the context (marked with "📄 DOWNLOADABLE: [URL]"):
1. YOU MUST copy the EXACT FULL URL that appears after "📄 DOWNLOADABLE:" in the context
2. DO NOT modify, shorten, truncate, or change the URL in ANY way - copy it character-for-character including the FULL UUID
3. The URL will contain a complete UUID (36 characters with dashes: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
4. Format: [📄 Download Filename.pdf](PASTE_EXACT_FULL_URL_HERE)
5. If no URL is provided in the context, do NOT include a download link
6. Proactively mention downloadable documents when relevant


When suggesting downloads:
- Be specific about what the document contains
- Explain when/how they should use it

Answer based on the provided context. If the context doesn't contain the answer, use your knowledge but mention that users can contact the office for the most up-to-date information.`

export async function POST(req: NextRequest) {
  const startTime = Date.now() // Track response time for analytics
  let errorOccurred = false
  let chunksUsed = 0

  try {
    const { message, sessionToken } = await req.json()

    if (!message || !sessionToken) {
      console.error('Missing message or sessionToken')
      return new Response('Missing message or sessionToken', { status: 400 })
    }

    console.log('Chat stream - Session token:', sessionToken)

    const supabaseAdmin = getSupabaseAdmin()

    // Get or create session
    let { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('id')
      .eq('session_token', sessionToken)
      .single()

    // If session doesn't exist, create it
    if (!session && sessionError?.code === 'PGRST116') {
      console.log('Session not found, creating new session')
      const { data: newSession, error: createError } = await supabaseAdmin
        .from('chat_sessions')
        .insert({ session_token: sessionToken })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating session:', createError)
        return new Response(`Session creation error: ${createError.message}`, { status: 500 })
      }

      session = newSession
      console.log('New session created:', session?.id)
    } else if (sessionError) {
      console.error('Session lookup error:', sessionError)
      return new Response(`Session error: ${sessionError.message}`, { status: 500 })
    } else if (session) {
      console.log('Chat stream - Session found:', session.id)
    }

    // Ensure session exists
    if (!session) {
      return new Response('Failed to get or create session', { status: 500 })
    }

    // Save user message
    await supabaseAdmin.from('chat_messages').insert({
      session_id: session.id,
      role: 'user',
      content: message,
    })

    // Get relevant context from Pinecone using RAG
    const { context, chunkCount } = await getRelevantContext(message)
    chunksUsed = chunkCount

    // Get recent conversation history
    const { data: recentMessages } = await supabaseAdmin
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const conversationHistory = (recentMessages || [])
      .reverse()
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = ''

          // Build messages array for OpenAI
          const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...(context
              ? [
                  {
                    role: 'system',
                    content: `Relevant information from our documents:\n\n${context}`,
                  },
                ]
              : []),
            ...conversationHistory,
          ]

          // Stream from OpenAI
          const chatStream = await getChatCompletionStream(messages as any)

          for await (const chunk of chatStream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              const data = JSON.stringify({ content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Save assistant message
          await supabaseAdmin.from('chat_messages').insert({
            session_id: session.id,
            role: 'assistant',
            content: fullResponse,
          })

          // Track analytics (anonymized)
          const responseTime = Date.now() - startTime
          const analyticsData = formatAnalyticsData(
            message,
            responseTime,
            false, // No web search in current implementation
            {
              documents: chunksUsed > 0 ? 1 : 0,
              chunks: chunksUsed,
            },
            errorOccurred
          )

          // Save analytics
          await supabaseAdmin.from('chat_analytics').insert(analyticsData)

          // Send completion
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          errorOccurred = true

          // Try to save analytics even on error
          try {
            const responseTime = Date.now() - startTime
            const analyticsData = formatAnalyticsData(
              message,
              responseTime,
              false,
              { documents: 0, chunks: 0 },
              true
            )
            await supabaseAdmin.from('chat_analytics').insert(analyticsData)
          } catch (analyticsError) {
            console.error('Failed to save analytics:', analyticsError)
          }

          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat stream error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

async function getRelevantContext(
  query: string
): Promise<{ context: string | null; chunkCount: number }> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Query Pinecone for relevant document chunks
    const pinecone = await getPineconeClient()
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    })

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return { context: null, chunkCount: 0 }
    }

    // Create a map of embedding_id to Pinecone match for proper metadata lookup
    const matchMap = new Map(queryResponse.matches.map((match) => [match.id, match]))

    const supabaseAdmin = getSupabaseAdmin()

    // Fetch the actual content from Supabase
    const { data: chunks } = await supabaseAdmin
      .from('document_chunks')
      .select('content, document_id, embedding_id, documents(title, is_downloadable, public_url)')
      .in('embedding_id', Array.from(matchMap.keys()))

    if (!chunks || chunks.length === 0) {
      return { context: null, chunkCount: 0 }
    }

    // Format context with download information
    const contextParts: string[] = []

    chunks.forEach((chunk: any) => {
      // Get the corresponding Pinecone match using embedding_id
      const match = matchMap.get(chunk.embedding_id)
      if (!match) return

      const score = match.score || 0
      if (score < 0.7) return // Filter low relevance

      const metadata = match.metadata
      const isDownloadable = chunk.documents?.is_downloadable || metadata?.is_downloadable
      const title = chunk.documents?.title || metadata?.document_title || 'Document'

      // Debug logging
      console.log('DEBUG - Processing chunk:', {
        embedding_id: chunk.embedding_id,
        document_id: chunk.document_id,
        metadata_download_url: metadata?.download_url,
        metadata_keys: metadata ? Object.keys(metadata) : [],
        isDownloadable,
        title
      })

      // Use download URL from Pinecone metadata (this is the correct, actual URL)
      let downloadUrl = metadata?.download_url

      // Only generate fallback URL if Pinecone doesn't have it
      if (isDownloadable && !downloadUrl && chunk.document_id) {
        const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/$/, '')
        downloadUrl = `${baseUrl}/api/documents/download/${chunk.document_id}`
        console.log('DEBUG - Generated fallback URL:', downloadUrl)
      }

      console.log('DEBUG - Final downloadUrl:', downloadUrl)

      // Build context string
      let contextStr = `[${title}]`

      if (isDownloadable && downloadUrl) {
        contextStr += ` 📄 DOWNLOADABLE: ${downloadUrl}`
      }

      contextStr += `\n${chunk.content}`

      contextParts.push(contextStr)
    })

    const context = contextParts.join('\n\n---\n\n')

    // Debug: Log the final context to verify URLs are complete
    console.log('DEBUG - Final context being sent to AI:')
    console.log(context)

    return {
      context: context || null,
      chunkCount: contextParts.length,
    }
  } catch (error) {
    console.error('Error getting context:', error)
    return { context: null, chunkCount: 0 }
  }
}
