import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client (uses anon key, respects RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (uses service key, bypasses RLS)
// Use this for admin operations and document processing
// This function ensures the admin client is only created server-side
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin can only be called server-side')
  }

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_KEY environment variable is not set')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
