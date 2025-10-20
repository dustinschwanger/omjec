import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies'

// Server-side auth helper for App Router (for use in Server Components)
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting errors in read-only contexts
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie removal errors in read-only contexts
          }
        },
      },
    }
  )
}

// Server-side auth helper for API Routes (accepts request cookies)
export function createServerSupabaseClientFromCookies(cookieStore: RequestCookies | ReadonlyRequestCookies) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // No-op in API routes - cookies are read-only
        },
        remove(name: string, options: CookieOptions) {
          // No-op in API routes - cookies are read-only
        },
      },
    }
  )
}

type ReadonlyRequestCookies = {
  get: (name: string) => { name: string; value: string } | undefined
}

// Get current admin user
export async function getAdminUser() {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Check if user is in admin_users table
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('auth_id', user.id)
    .eq('is_active', true)
    .single()

  if (!adminUser) {
    return null
  }

  return { ...user, isAdmin: true }
}
