import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getPineconeClient } from '@/lib/pinecone'
import { generateEmbedding, getChatCompletionStream } from '@/lib/openai'
import { formatAnalyticsData } from '@/lib/chat-analytics'

// Using Node.js runtime for Pinecone compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Safe logger that won't crash on circular structures
const log = (...args: any[]) => {
  try {
    console.log('[CHAT]', ...args)
  } catch (e) {
    console.log('[CHAT] Log error:', String(e))
  }
}

// Type for Supabase chunk rows with join
type ChunkRow = {
  content: string
  document_id: string
  embedding_id: string
  documents?: {
    title?: string | null
    is_downloadable?: boolean | null
    public_url?: string | null
  } | null
}

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
    const { context, chunkCount, debug } = await getRelevantContext(message)
    chunksUsed = chunkCount

    // Log debug info
    log('RAG Debug Info:', debug)

    // Fail fast if no context - don't let AI hallucinate
    if (!context || chunkCount === 0) {
      log('❌ No context retrieved, failing fast to prevent hallucination')
      return new Response(
        JSON.stringify({
          error: 'No relevant documents found for your query. Please try rephrasing or contact the office directly.',
          debug: debug
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get recent conversation history (limit to 8 turns to prevent token overflow)
    const { data: recentMessages } = await supabaseAdmin
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: false })
      .limit(8)

    const conversationHistory = (recentMessages || [])
      .reverse()
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))

    log('Conversation history length:', conversationHistory.length)

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

          // Log what we're sending to OpenAI
          log('Sending to OpenAI:', {
            messageCount: messages.length,
            hasSystemPrompt: messages[0].role === 'system',
            hasContext: messages.length > 1 && messages[1].role === 'system',
            contextPreview: context?.slice(0, 200) + '...',
            historyLength: conversationHistory.length
          })

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
): Promise<{ context: string | null; chunkCount: number; debug: Record<string, any> }> {
  const debug: Record<string, any> = { phase: 'start', query }

  try {
    // Log runtime type
    const runtimeType = (globalThis as any)?.EdgeRuntime ? 'edge' : 'node'
    debug.runtime = runtimeType
    log('Runtime type:', runtimeType)

    if (runtimeType === 'edge') {
      log('⚠️ WARNING: Running on Edge runtime, should be Node!')
    }

    // 1) Generate embedding
    debug.phase = 'embedding'
    const queryEmbedding = await generateEmbedding(query)
    debug.embeddingDim = queryEmbedding.length
    log('Embedding dimension:', queryEmbedding.length)

    // 2) Query Pinecone
    debug.phase = 'pinecone_query'
    const pinecone = await getPineconeClient()
    const indexName = process.env.PINECONE_INDEX_NAME!
    const index = pinecone.index(indexName)
    debug.indexName = indexName

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    })

    debug.pineconeTopK = queryResponse.matches?.length ?? 0
    debug.pineconeIds = queryResponse.matches?.map((m) => m.id) ?? []
    log('Pinecone returned', debug.pineconeTopK, 'matches')
    log('Pinecone IDs:', debug.pineconeIds)

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      log('❌ No Pinecone matches found')
      return { context: null, chunkCount: 0, debug }
    }

    // 3) Map Pinecone results
    debug.phase = 'mapping'
    const keys = queryResponse.matches.map((m) => m.id)
    const matchMap = new Map(queryResponse.matches.map((m) => [m.id, m]))
    log('Created match map with', matchMap.size, 'entries')

    // 4) Fetch from Supabase
    debug.phase = 'supabase_fetch'
    const supabaseAdmin = getSupabaseAdmin()

    const { data: chunks, error: supabaseError } = await supabaseAdmin
      .from('document_chunks')
      .select('content, document_id, embedding_id, documents(title, is_downloadable, public_url)')
      .in('embedding_id', keys as string[])

    if (supabaseError) {
      debug.supabaseError = String(supabaseError.message || supabaseError)
      log('❌ Supabase error:', debug.supabaseError)
      return { context: null, chunkCount: 0, debug }
    }

    debug.supabaseRows = chunks?.length ?? 0
    log('Supabase returned', debug.supabaseRows, 'rows')

    // Diagnostic: Which Pinecone IDs didn't resolve in Supabase?
    const foundSet = new Set((chunks ?? []).map((c: any) => c.embedding_id))
    debug.unmatchedIds = keys.filter((k) => !foundSet.has(k))

    if (debug.unmatchedIds.length > 0) {
      log('⚠️ Unmatched IDs (in Pinecone but not Supabase):', debug.unmatchedIds)
      log('This suggests ID format mismatch between Pinecone and Supabase')
    }

    if (!chunks || chunks.length === 0) {
      log('❌ No chunks returned from Supabase')
      return { context: null, chunkCount: 0, debug }
    }

    // 5) Build context
    debug.phase = 'build_context'
    const contextParts: string[] = []

    for (const chunk of (chunks as ChunkRow[] | null) ?? []) {
      const match = matchMap.get(chunk.embedding_id)
      if (!match) {
        log('⚠️ Chunk not in match map:', chunk.embedding_id)
        continue
      }

      const score = match.score || 0
      // Lower threshold to 0.5 - scores of 0.5-0.7 are typically good semantic matches
      if (score < 0.5) {
        log('Filtered out low relevance chunk:', chunk.embedding_id, 'score:', score)
        continue
      }

      const meta: any = match.metadata || {}
      const downloadUrl = meta.download_url as string | undefined

      // Use explicit fallbacks to avoid undefined
      const title = chunk.documents?.title ?? meta.document_title ?? 'Untitled Document'
      const isDownloadable = Boolean(chunk.documents?.is_downloadable ?? meta.is_downloadable)

      log('Processing chunk:', {
        embedding_id: chunk.embedding_id,
        document_id: chunk.document_id,
        title,
        isDownloadable,
        downloadUrl,
        score
      })

      let contextStr = `[${title}]`
      if (isDownloadable && downloadUrl) {
        contextStr += ` 📄 DOWNLOADABLE: ${downloadUrl}`
      }
      contextStr += `\n${chunk.content}`

      contextParts.push(contextStr)
    }

    debug.contextCount = contextParts.length
    debug.sampleContextHead = contextParts[0]?.slice(0, 160)

    log('Built', contextParts.length, 'context parts')
    log('Sample context head:', debug.sampleContextHead)

    if (contextParts.length === 0) {
      log('❌ Built zero context parts - check ID format or join')
      return { context: null, chunkCount: 0, debug }
    }

    const context = contextParts.join('\n\n---\n\n')
    debug.phase = 'complete'

    log('✅ Context built successfully, length:', context.length)

    return {
      context: context || null,
      chunkCount: contextParts.length,
      debug,
    }
  } catch (error) {
    debug.phase = 'error'
    debug.error = error instanceof Error ? error.message : String(error)
    debug.stack = error instanceof Error ? error.stack : undefined
    log('❌ Error in getRelevantContext:', debug.error)
    log('Stack:', debug.stack)
    return { context: null, chunkCount: 0, debug }
  }
}
