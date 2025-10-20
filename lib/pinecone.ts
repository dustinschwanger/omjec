import { Pinecone } from '@pinecone-database/pinecone'

let pineconeClient: Pinecone | null = null

// Singleton pattern for Pinecone client
export const getPineconeClient = async () => {
  try {
    if (!pineconeClient) {
      console.log('Pinecone: Initializing client')

      if (!process.env.PINECONE_API_KEY) {
        throw new Error('PINECONE_API_KEY environment variable is not set')
      }

      pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
      })
      console.log('Pinecone: Client initialized successfully')
    }
    return pineconeClient
  } catch (error) {
    console.error('Pinecone: Failed to initialize client:', error)
    throw new Error(`Pinecone client initialization failed: ${error}`)
  }
}

// Get Pinecone index reference
export const getPineconeIndex = async () => {
  try {
    console.log('Pinecone: Getting index:', process.env.PINECONE_INDEX_NAME)

    if (!process.env.PINECONE_INDEX_NAME) {
      throw new Error('PINECONE_INDEX_NAME environment variable is not set')
    }

    const client = await getPineconeClient()
    const index = client.index(process.env.PINECONE_INDEX_NAME)
    console.log('Pinecone: Index retrieved successfully')
    return index
  } catch (error) {
    console.error('Pinecone: Failed to get index:', error)
    throw new Error(`Pinecone index retrieval failed: ${error}`)
  }
}
