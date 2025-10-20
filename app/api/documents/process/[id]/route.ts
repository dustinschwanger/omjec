import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { processDocument, type DocumentToProcess } from '@/lib/document-processor'

// Use Node.js runtime for file processing
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max

/**
 * POST /api/documents/process/[id]
 * Triggers document processing: text extraction, chunking, embedding generation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    console.log(`Processing request received for document: ${id}`)

    const supabase = getSupabaseAdmin()

    // Fetch document details
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if already processed
    if (document.status === 'processed') {
      return NextResponse.json({
        success: true,
        message: 'Document already processed',
        documentId: id,
      })
    }

    // Prepare document for processing
    const documentToProcess: DocumentToProcess = {
      id: document.id,
      title: document.title,
      filename: document.filename,
      type: document.type,
      storage_path: document.storage_path,
      public_url: document.public_url,
      is_downloadable: document.is_downloadable || false,
      metadata: document.metadata,
    }

    // Process document
    const result = await processDocument(documentToProcess)

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Processing failed',
          documentId: id,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Document processed successfully',
      result: {
        documentId: result.documentId,
        chunksCreated: result.chunksCreated,
        embeddingsGenerated: result.embeddingsGenerated,
        stats: result.stats,
      },
    })
  } catch (error: any) {
    console.error('Document processing error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/documents/process/[id]
 * Get processing status for a document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = getSupabaseAdmin()

    const { data: document, error } = await supabase
      .from('documents')
      .select('id, status, created_at, updated_at')
      .eq('id', id)
      .single()

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Get chunk count
    const { count } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', id)

    return NextResponse.json({
      documentId: id,
      status: document.status,
      chunksCreated: count || 0,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    })
  } catch (error: any) {
    console.error('Error fetching processing status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
