/**
 * Document Chunking Utility
 * Splits documents into semantic chunks for embedding generation
 */

export interface DocumentChunk {
  content: string
  chunkIndex: number
  metadata: ChunkMetadata
}

export interface ChunkMetadata {
  documentId: string
  documentTitle: string
  documentType: string
  isDownloadable: boolean
  downloadUrl?: string
  totalChunks?: number
}

interface ChunkingOptions {
  maxTokens?: number // Approximate max tokens per chunk (~4 chars = 1 token)
  overlap?: number // Number of characters to overlap between chunks
  preserveSentences?: boolean // Try to end chunks at sentence boundaries
}

const DEFAULT_OPTIONS: Required<ChunkingOptions> = {
  maxTokens: 500, // ~2000 characters
  overlap: 200, // ~200 character overlap
  preserveSentences: true,
}

/**
 * Estimate token count (rough approximation)
 */
function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

/**
 * Find the last sentence boundary before maxLength
 */
function findSentenceBoundary(text: string, maxLength: number): number {
  if (text.length <= maxLength) {
    return text.length
  }

  const slice = text.slice(0, maxLength)

  // Look for sentence endings (., !, ?)
  const sentenceEndings = ['. ', '! ', '? ', '.\n', '!\n', '?\n']

  let lastBoundary = -1
  for (const ending of sentenceEndings) {
    const index = slice.lastIndexOf(ending)
    if (index > lastBoundary) {
      lastBoundary = index + ending.length
    }
  }

  // If no sentence boundary found, try to find last space
  if (lastBoundary === -1) {
    lastBoundary = slice.lastIndexOf(' ')
  }

  // If still no boundary, just use maxLength
  return lastBoundary > 0 ? lastBoundary : maxLength
}

/**
 * Split text into chunks
 */
export function chunkText(
  text: string,
  metadata: Omit<ChunkMetadata, 'totalChunks'>,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const maxChars = opts.maxTokens * 4 // Convert tokens to chars

  if (!text || text.trim().length === 0) {
    return []
  }

  const chunks: DocumentChunk[] = []
  let startIndex = 0
  let chunkIndex = 0

  while (startIndex < text.length) {
    // Determine chunk end position
    const remainingText = text.slice(startIndex)
    let endIndex = Math.min(startIndex + maxChars, text.length)

    if (opts.preserveSentences && endIndex < text.length) {
      // Find sentence boundary
      const relativeEnd = findSentenceBoundary(remainingText, maxChars)
      endIndex = startIndex + relativeEnd
    }

    // Extract chunk
    const chunkContent = text.slice(startIndex, endIndex).trim()

    if (chunkContent.length > 0) {
      chunks.push({
        content: chunkContent,
        chunkIndex: chunkIndex++,
        metadata: {
          ...metadata,
          totalChunks: 0, // Will be updated after all chunks are created
        },
      })
    }

    // Move to next chunk with overlap
    startIndex = endIndex - opts.overlap

    // Ensure we make progress if overlap is too large
    if (startIndex <= chunks[chunks.length - 1]?.chunkIndex || startIndex >= text.length) {
      break
    }
  }

  // Update total chunks count
  chunks.forEach((chunk) => {
    chunk.metadata.totalChunks = chunks.length
  })

  return chunks
}

/**
 * Validate chunks
 */
export function validateChunks(chunks: DocumentChunk[]): boolean {
  if (!chunks || chunks.length === 0) {
    return false
  }

  // Check that all chunks have content
  for (const chunk of chunks) {
    if (!chunk.content || chunk.content.trim().length === 0) {
      return false
    }

    // Check token count
    const tokenCount = estimateTokenCount(chunk.content)
    if (tokenCount > 600) {
      // Allow slight overflow
      console.warn(`Chunk ${chunk.chunkIndex} exceeds token limit: ${tokenCount} tokens`)
    }
  }

  return true
}

/**
 * Get chunk statistics
 */
export function getChunkStats(chunks: DocumentChunk[]): {
  totalChunks: number
  avgTokensPerChunk: number
  minTokens: number
  maxTokens: number
  totalTokens: number
} {
  if (chunks.length === 0) {
    return {
      totalChunks: 0,
      avgTokensPerChunk: 0,
      minTokens: 0,
      maxTokens: 0,
      totalTokens: 0,
    }
  }

  const tokenCounts = chunks.map((chunk) => estimateTokenCount(chunk.content))
  const totalTokens = tokenCounts.reduce((sum, count) => sum + count, 0)

  return {
    totalChunks: chunks.length,
    avgTokensPerChunk: Math.round(totalTokens / chunks.length),
    minTokens: Math.min(...tokenCounts),
    maxTokens: Math.max(...tokenCounts),
    totalTokens,
  }
}

/**
 * Prepare chunks for database insert
 */
export interface ChunkForDB {
  document_id: string
  content: string
  chunk_index: number
  metadata?: Record<string, any>
}

export function prepareChunksForDB(
  chunks: DocumentChunk[],
  documentId: string
): ChunkForDB[] {
  return chunks.map((chunk) => ({
    document_id: documentId,
    content: chunk.content,
    chunk_index: chunk.chunkIndex,
    metadata: chunk.metadata,
  }))
}
