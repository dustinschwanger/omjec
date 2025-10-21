/**
 * Cleanup script to delete all vectors from Pinecone
 * Run this to remove duplicate/corrupted embeddings
 *
 * Usage: npx tsx scripts/cleanup-pinecone.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

import { getPineconeClient } from '../lib/pinecone'

async function cleanupPinecone() {
  try {
    console.log('🧹 Starting Pinecone cleanup...')

    const pinecone = await getPineconeClient()
    const indexName = process.env.PINECONE_INDEX_NAME

    if (!indexName) {
      throw new Error('PINECONE_INDEX_NAME environment variable is not set')
    }

    const index = pinecone.index(indexName)

    // Delete all vectors from the index
    console.log(`Deleting all vectors from index: ${indexName}`)
    await index.deleteAll()

    console.log('✅ All vectors deleted from Pinecone successfully!')
    console.log('You can now upload documents and they will be processed cleanly.')

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  }
}

cleanupPinecone()
