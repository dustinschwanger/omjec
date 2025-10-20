import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/documents/download/[id]
 * Public endpoint to download documents with tracking
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = getSupabaseAdmin()

    // Get document details
    const { data: document, error } = await supabase
      .from('documents')
      .select('id, title, public_url, is_downloadable, status')
      .eq('id', id)
      .single()

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if document is downloadable
    if (!document.is_downloadable) {
      return NextResponse.json(
        { error: 'This document is not available for download' },
        { status: 403 }
      )
    }

    // Check if document is processed
    if (document.status !== 'processed') {
      return NextResponse.json(
        { error: 'Document is still being processed. Please try again later.' },
        { status: 425 } // 425 Too Early
      )
    }

    // Track download (upsert pattern - insert or update)
    await trackDownload(id, supabase)

    // Redirect to the file URL
    if (!document.public_url) {
      return NextResponse.json(
        { error: 'Document file not found' },
        { status: 404 }
      )
    }

    return NextResponse.redirect(document.public_url, 302)
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Track document download
 */
async function trackDownload(documentId: string, supabase: any) {
  try {
    // Check if record exists
    const { data: existing } = await supabase
      .from('document_downloads')
      .select('id, download_count')
      .eq('document_id', documentId)
      .single()

    if (existing) {
      // Update existing record
      await supabase
        .from('document_downloads')
        .update({
          download_count: existing.download_count + 1,
          last_downloaded_at: new Date().toISOString(),
        })
        .eq('document_id', documentId)
    } else {
      // Insert new record
      await supabase
        .from('document_downloads')
        .insert({
          document_id: documentId,
          download_count: 1,
          last_downloaded_at: new Date().toISOString(),
        })
    }
  } catch (error) {
    console.error('Error tracking download:', error)
    // Don't fail the download if tracking fails
  }
}
