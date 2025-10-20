import OpenAI from 'openai'

// OpenAI client for chat completions and embeddings
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Generate embedding vector for text (used for RAG)
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log('OpenAI: Generating embedding for text:', text.substring(0, 100))
    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      input: text,
    })
    console.log('OpenAI: Embedding generated successfully')
    return response.data[0].embedding
  } catch (error) {
    console.error('OpenAI: Failed to generate embedding:', error)
    throw new Error(`Embedding generation failed: ${error}`)
  }
}

// Get chat completion with retry logic (streaming)
export async function getChatCompletionStream(
  messages: Array<{ role: string; content: string }>
) {
  let retryCount = 0
  const maxRetries = 3

  while (retryCount < maxRetries) {
    try {
      console.log('OpenAI: Starting streaming chat completion with model', process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini')
      console.log('OpenAI: Message count:', messages.length)

      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is not set')
      }

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
        max_tokens: 4000,
        temperature: 0.7,
        messages: messages as any,
        stream: true
      })

      console.log('OpenAI: Chat completion stream successful')
      return response

    } catch (error: any) {
      retryCount++
      console.error(`OpenAI: Chat completion attempt ${retryCount} failed:`, error.message)

      if (retryCount < maxRetries) {
        console.log(`OpenAI: Retrying chat completion (${retryCount}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // Exponential backoff
      } else {
        console.error('OpenAI: All retry attempts failed')
        throw new Error(`Chat completion failed after ${maxRetries} attempts: ${error.message}`)
      }
    }
  }

  throw new Error('Chat completion failed: no response received')
}

// Get chat completion with retry logic (non-streaming)
export async function getChatCompletion(
  messages: Array<{ role: string; content: string }>
) {
  let retryCount = 0
  const maxRetries = 3

  while (retryCount < maxRetries) {
    try {
      console.log('OpenAI: Starting chat completion with model', process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini')
      console.log('OpenAI: Message count:', messages.length)

      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is not set')
      }

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
        max_tokens: 4000,
        temperature: 0.7,
        messages: messages as any,
        stream: false
      })

      console.log('OpenAI: Chat completion successful')
      return response

    } catch (error: any) {
      retryCount++
      console.error(`OpenAI: Chat completion attempt ${retryCount} failed:`, error.message)

      if (retryCount < maxRetries) {
        console.log(`OpenAI: Retrying chat completion (${retryCount}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // Exponential backoff
      } else {
        console.error('OpenAI: All retry attempts failed')
        throw new Error(`Chat completion failed after ${maxRetries} attempts: ${error.message}`)
      }
    }
  }

  throw new Error('Chat completion failed: no response received')
}
