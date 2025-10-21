import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClientFromCookies } from '@/lib/supabase-auth'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { deleteDocumentEmbeddings } from '@/lib/document-processor'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authorization token from header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Create Supabase client and verify token
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClientFromCookies(cookieStore)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin using service role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('auth_id', user.id)
      .eq('is_active', true)
      .single()

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get document ID from params
    const { id } = await params

    // Get document to find storage path using admin client
    const { data: document, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete embeddings from Pinecone first
    console.log(`Deleting embeddings from Pinecone for document: ${id}`)
    await deleteDocumentEmbeddings(id)

    // Delete file from storage using admin client
    if (document.storage_path) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('documents')
        .remove([document.storage_path])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Continue with database deletion even if storage fails
      }
    }

    // Delete document from database using admin client (this will cascade to document_chunks)
    const { error: deleteError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Database deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClientFromCookies(cookieStore)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin using service role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('auth_id', user.id)
      .eq('is_active', true)
      .single()

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get document ID from params
    const { id } = await params

    // Get document details using admin client
    const { data: document, error: fetchError } = await supabaseAdmin
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

    return NextResponse.json({
      success: true,
      document
    })

  } catch (error: any) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
