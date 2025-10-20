import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClientFromCookies } from '@/lib/supabase-auth'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp'
]

export async function POST(request: NextRequest) {
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

    // Create Supabase client with the token
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClientFromCookies(cookieStore)

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Authentication failed: ' + authError.message },
        { status: 401 }
      )
    }

    if (!user) {
      console.error('No user found for token')
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.email)
    console.log('User ID:', user.id)

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

    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('auth_id', user.id)
      .eq('is_active', true)
      .single()

    console.log('Admin query result:', { adminUser, adminError })

    if (adminError || !adminUser) {
      console.error('Admin check failed:', adminError)
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const type = formData.get('type') as string
    const isDownloadable = formData.get('isDownloadable') === 'true'

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Document title is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: PDF, Word documents, Images (JPG, PNG, WebP)' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const storagePath = `documents/${fileName}`

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage using admin client
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(storagePath)

    // Create document record in database using admin client
    // For now, just store basic info - we'll add text extraction in Phase 7
    const { data: document, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert({
        title: title.trim(),
        filename: file.name,
        type: type || 'general',
        content: 'Processing...', // Will be replaced when processed
        content_preview: 'Document uploaded successfully. Processing pending.',
        status: 'processing',
        file_size: file.size,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        is_downloadable: isDownloadable,
        metadata: {
          original_filename: file.name,
          mime_type: file.type,
          uploaded_by: user.id,
          uploaded_at: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)

      // Clean up uploaded file if database insert fails
      await supabaseAdmin.storage.from('documents').remove([storagePath])

      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      )
    }

    // Trigger background processing (fire and forget)
    // We don't await this to avoid blocking the upload response
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/documents/process/${document.id}`, {
      method: 'POST',
    }).catch((error) => {
      console.error('Failed to trigger document processing:', error)
      // Processing can be triggered manually from admin dashboard if this fails
    })

    return NextResponse.json({
      success: true,
      document,
      message: 'Document uploaded successfully. Processing started in background.',
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
