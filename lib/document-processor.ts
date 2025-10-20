/**
 * Document Processing Pipeline
 * Orchestrates text extraction, chunking, embedding generation, and storage
 */

import { extractText, cleanExtractedText, validateExtractedText } from './text-extraction'
import { chunkText, validateChunks, getChunkStats, prepareChunksForDB, type DocumentChunk } from './chunking'
import { generateEmbedding } from './openai'
import { getPineconeClient } from './pinecone'
import { getSupabaseAdmin } from './supabase'
import { v4 as uuidv4 } from 'uuid'

export interface ProcessingResult {
  success: boolean
  documentId: string
  chunksCreated: number
  embeddingsGenerated: number
  error?: string
  stats?: {
    textLength: number
    avgTokensPerChunk: number
    totalTokens: number
  }
}

export interface DocumentToProcess {
  id: string
  title: string
  filename: string
  type: string
  storage_path: string
  public_url: string
  is_downloadable: boolean
  metadata?: any
}

/**
 * Process a single document: extract text, chunk, embed, and store
 */
export async function processDocument(document: DocumentToProcess): Promise<ProcessingResult> {
  console.log(`Starting processing for document: ${document.id} - ${document.title}`)

  try {
    const supabase = getSupabaseAdmin()

    // Step 1: Download file from storage
    console.log('Step 1: Downloading file from storage...')
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.storage_path)

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`)
    }

    // Step 2: Extract text from file
    console.log('Step 2: Extracting text...')
    const buffer = Buffer.from(await fileData.arrayBuffer())
    const mimeType = document.metadata?.mime_type || 'application/pdf'

    let extractedText = await extractText(buffer, mimeType)
    extractedText = cleanExtractedText(extractedText)

    if (!validateExtractedText(extractedText)) {
      throw new Error('Extracted text is too short or invalid')
    }

    console.log(`Extracted ${extractedText.length} characters`)

    // Step 3: Update document with extracted content
    console.log('Step 3: Updating document with extracted content...')
    const contentPreview = extractedText.slice(0, 500) + (extractedText.length > 500 ? '...' : '')

    const { error: updateError } = await supabase
      .from('documents')
      .update({
        content: extractedText,
        content_preview: contentPreview,
        updated_at: new Date().toISOString(),
      })
      .eq('id', document.id)

    if (updateError) {
      console.error('Failed to update document content:', updateError)
      // Continue processing even if update fails
    }

    // Step 4: Create chunks
    console.log('Step 4: Creating chunks...')
    // Use download API URL for tracking
    const downloadUrl = document.is_downloadable
      ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/documents/download/${document.id}`
      : undefined

    const chunks = chunkText(extractedText, {
      documentId: document.id,
      documentTitle: document.title,
      documentType: document.type,
      isDownloadable: document.is_downloadable,
      downloadUrl,
    })

    if (!validateChunks(chunks)) {
      throw new Error('Generated chunks are invalid')
    }

    const stats = getChunkStats(chunks)
    console.log('Chunk stats:', stats)

    // Step 5: Generate embeddings and store in Pinecone
    console.log('Step 5: Generating embeddings and storing in Pinecone...')
    const embeddingIds = await generateAndStoreEmbeddings(chunks, document)

    // Step 6: Store chunks in Supabase
    console.log('Step 6: Storing chunks in Supabase...')
    const chunksForDB = prepareChunksForDB(chunks, document.id)

    // Add embedding IDs to chunks
    const chunksWithEmbeddings = chunksForDB.map((chunk, index) => ({
      ...chunk,
      embedding_id: embeddingIds[index],
    }))

    const { error: chunksError } = await supabase.from('document_chunks').insert(chunksWithEmbeddings)

    if (chunksError) {
      throw new Error(`Failed to store chunks: ${chunksError.message}`)
    }

    // Step 7: Update document status to processed
    console.log('Step 7: Updating document status to processed...')
    const { error: statusError } = await supabase
      .from('documents')
      .update({
        status: 'processed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', document.id)

    if (statusError) {
      console.error('Failed to update document status:', statusError)
    }

    console.log(`✅ Document processing complete: ${document.id}`)

    return {
      success: true,
      documentId: document.id,
      chunksCreated: chunks.length,
      embeddingsGenerated: embeddingIds.length,
      stats: {
        textLength: extractedText.length,
        avgTokensPerChunk: stats.avgTokensPerChunk,
        totalTokens: stats.totalTokens,
      },
    }
  } catch (error) {
    console.error(`❌ Document processing failed: ${document.id}`, error)

    // Update document status to failed
    try {
      const supabase = getSupabaseAdmin()
      await supabase
        .from('documents')
        .update({
          status: 'failed',
          metadata: {
            ...document.metadata,
            error: error instanceof Error ? error.message : 'Unknown error',
            failed_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', document.id)
    } catch (updateError) {
      console.error('Failed to update document status to failed:', updateError)
    }

    return {
      success: false,
      documentId: document.id,
      chunksCreated: 0,
      embeddingsGenerated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate embeddings for chunks and store in Pinecone
 */
async function generateAndStoreEmbeddings(
  chunks: DocumentChunk[],
  document: DocumentToProcess
): Promise<string[]> {
  const pinecone = await getPineconeClient()
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)
  const embeddingIds: string[] = []

  // Generate download API URL
  const downloadUrl = document.is_downloadable
    ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/documents/download/${document.id}`
    : undefined

  // Process chunks in batches to avoid rate limits
  const batchSize = 5
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    const batchPromises = batch.map(async (chunk) => {
      // Generate embedding
      const embedding = await generateEmbedding(chunk.content)

      // Create unique ID for this embedding
      const embeddingId = `${document.id}_chunk_${chunk.chunkIndex}`

      // Store in Pinecone with metadata
      await index.upsert([
        {
          id: embeddingId,
          values: embedding,
          metadata: {
            document_id: document.id,
            document_title: document.title,
            document_type: document.type,
            chunk_index: chunk.chunkIndex,
            total_chunks: chunk.metadata.totalChunks || 0,
            is_downloadable: document.is_downloadable,
            download_url: downloadUrl,
            content_preview: chunk.content.slice(0, 200),
          },
        },
      ])

      return embeddingId
    })

    const batchIds = await Promise.all(batchPromises)
    embeddingIds.push(...batchIds)

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < chunks.length) {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  return embeddingIds
}

/**
 * Delete document embeddings from Pinecone
 */
export async function deleteDocumentEmbeddings(documentId: string): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()

    // Get all embedding IDs for this document
    const { data: chunks } = await supabase
      .from('document_chunks')
      .select('embedding_id')
      .eq('document_id', documentId)

    if (!chunks || chunks.length === 0) {
      return
    }

    const embeddingIds = chunks.map((chunk) => chunk.embedding_id).filter(Boolean) as string[]

    if (embeddingIds.length > 0) {
      const pinecone = await getPineconeClient()
      const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)

      await index.deleteMany(embeddingIds)
      console.log(`Deleted ${embeddingIds.length} embeddings from Pinecone for document ${documentId}`)
    }
  } catch (error) {
    console.error('Error deleting embeddings from Pinecone:', error)
    // Don't throw - this is a cleanup operation
  }
}
