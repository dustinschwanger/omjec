/**
 * Cleanup script to delete the old OJT document with localhost URL
 * Run this to remove the document with ID: b8c37163-d2ae-4903-972f-646e5470a952
 *
 * Usage: npx tsx scripts/cleanup-old-ojt-doc.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

import { getPineconeClient } from '../lib/pinecone'
import { createClient } from '@supabase/supabase-js'

const OLD_DOCUMENT_ID = 'b8c37163-d2ae-4903-972f-646e5470a952'

async function cleanup() {
  try {
    console.log('🧹 Cleaning up old OJT document...')

    // Initialize Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all embedding IDs for the old document
    const { data: chunks } = await supabase
      .from('document_chunks')
      .select('embedding_id')
      .eq('document_id', OLD_DOCUMENT_ID)

    if (!chunks || chunks.length === 0) {
      console.log('✅ No chunks found in database (might be already deleted)')
    } else {
      console.log(`Found ${chunks.length} chunks to delete from Pinecone`)

      const embeddingIds = chunks.map((chunk) => chunk.embedding_id).filter(Boolean) as string[]

      if (embeddingIds.length > 0) {
        const pinecone = await getPineconeClient()
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)

        await index.deleteMany(embeddingIds)
        console.log(`✅ Deleted ${embeddingIds.length} embeddings from Pinecone`)
      }
    }

    // Get document details
    const { data: document } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', OLD_DOCUMENT_ID)
      .single()

    if (!document) {
      console.log('✅ Document not found in database (might be already deleted)')
      return
    }

    // Delete file from storage
    if (document.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.storage_path])

      if (storageError) {
        console.error('⚠️  Storage deletion error:', storageError)
      } else {
        console.log('✅ Deleted file from storage')
      }
    }

    // Delete document from database (cascades to chunks)
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', OLD_DOCUMENT_ID)

    if (deleteError) {
      console.error('❌ Database deletion error:', deleteError)
    } else {
      console.log('✅ Deleted document from database')
    }

    console.log('\n✅ Cleanup complete! The old document with localhost URL has been removed.')

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  }
}

cleanup()
