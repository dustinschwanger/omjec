import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const sessionToken = searchParams.get('sessionToken')

    if (!sessionToken) {
      console.error('Missing sessionToken in history request')
      return NextResponse.json({ error: 'Missing sessionToken' }, { status: 400 })
    }

    console.log('Chat history - Session token:', sessionToken)

    const supabaseAdmin = getSupabaseAdmin()

    // Get or create session
    let { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('id')
      .eq('session_token', sessionToken)
      .single()

    // If session doesn't exist, create it
    if (!session && sessionError?.code === 'PGRST116') {
      console.log('Session not found, creating new session')
      const { data: newSession, error: createError } = await supabaseAdmin
        .from('chat_sessions')
        .insert({ session_token: sessionToken })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating session:', createError)
        return NextResponse.json({ error: `Session creation error: ${createError.message}` }, { status: 500 })
      }

      session = newSession
      console.log('New session created:', session.id)
    } else if (sessionError) {
      console.error('Session lookup error:', sessionError)
      return NextResponse.json({ error: `Session error: ${sessionError.message}` }, { status: 500 })
    } else {
      console.log('Chat history - Session found:', session.id)
    }

    // Get messages
    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Chat history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
