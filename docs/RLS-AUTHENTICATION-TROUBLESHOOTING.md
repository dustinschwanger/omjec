# RLS Authentication Troubleshooting Guide

## Problem Summary

When attempting to upload documents through the admin panel, authenticated admin users received a **403 Forbidden** error with the message "Admin access required", despite being properly logged in and having admin privileges.

## Root Cause

The issue was caused by **Row Level Security (RLS) policies** blocking API routes from reading the `admin_users` table.

### What Happened

1. **User Authentication**: The user successfully authenticated with Supabase and obtained a valid session token
2. **API Request**: The client sent the Bearer token to `/api/documents/upload`
3. **Token Verification**: The API route verified the token and got the user's ID (`332273d0-58d5-40f7-a1d4-0d5b0450639a`)
4. **Admin Check Failure**: When querying `admin_users` table to check admin status, the query returned **0 rows**
5. **RLS Blocking**: The anon key client was subject to RLS policies, which prevented reading from `admin_users`

### Error Details

```
Admin query result: {
  adminUser: null,
  adminError: {
    code: 'PGRST116',
    details: 'The result contains 0 rows',
    hint: null,
    message: 'Cannot coerce the result to a single JSON object'
  }
}
```

Even though the record existed in the database:
- User ID: `332273d0-58d5-40f7-a1d4-0d5b0450639a`
- Email: `dustinschwanger@gmail.com`
- is_active: `true`

The query using the **anon key** couldn't see it due to RLS restrictions.

## The Solution

### Use Service Role Key for Admin Operations

Updated all admin API routes to use the **service role key** instead of the anon key for admin-specific operations:

```typescript
// Create admin client with service role (bypasses RLS)
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

// Use admin client for admin checks and operations
const { data: adminUser, error: adminError } = await supabaseAdmin
  .from('admin_users')
  .select('*')
  .eq('auth_id', user.id)
  .eq('is_active', true)
  .single()
```

### Files Modified

1. **`/app/api/documents/upload/route.ts`**
   - Added service role client for admin check
   - Used service role for storage upload and database insert

2. **`/app/api/documents/[id]/route.ts`**
   - Updated DELETE endpoint to use service role
   - Updated GET endpoint to use service role

### Security Considerations

**Why this is safe:**

1. ✅ We still verify the user's Bearer token first
2. ✅ We check if the verified user is an admin
3. ✅ Only then do we perform privileged operations
4. ✅ Service role is only used server-side, never exposed to client

**The authentication flow:**

```
Client Request → Bearer Token → Verify User (anon key) → Check Admin Status (service role) → Perform Operation (service role)
```

## How to Prevent This in the Future

### Best Practices

#### 1. **Understand the Two Key Types**

- **Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)**
  - Subject to RLS policies
  - Safe to expose to clients
  - Used for client-side operations
  - Limited by database policies

- **Service Role Key (`SUPABASE_SERVICE_KEY`)**
  - Bypasses RLS policies
  - **NEVER** expose to clients
  - Only use server-side
  - Full database access

#### 2. **When to Use Each Key**

**Use Anon Key when:**
- ✅ Client-side operations
- ✅ User authentication
- ✅ Reading public data
- ✅ Operations that should respect RLS

**Use Service Role Key when:**
- ✅ Admin operations
- ✅ Bulk operations
- ✅ System-level tasks
- ✅ Operations that need to bypass RLS
- ⚠️ **Only after verifying user permissions**

#### 3. **Design Pattern for Admin Operations**

```typescript
export async function POST(request: NextRequest) {
  try {
    // Step 1: Verify user authentication with anon key
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClientFromCookies(cookieStore)
    const authHeader = request.headers.get('authorization')
    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 2: Create service role client for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Step 3: Verify admin status with service role
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('auth_id', user.id)
      .eq('is_active', true)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Step 4: Perform privileged operations with service role
    const { data, error } = await supabaseAdmin
      .from('sensitive_table')
      .insert({ /* ... */ })

    // ...
  } catch (error) {
    // ...
  }
}
```

#### 4. **RLS Policy Considerations**

**Option A: Use Service Role (Recommended for Admin)**
- Simpler implementation
- Bypasses RLS complexity
- Requires careful authentication checks
- Best for admin-only operations

**Option B: Configure RLS Policies**
- More granular control
- Respects database-level security
- Can be complex to manage
- Good for mixed access patterns

For admin operations, **Option A** (service role) is recommended because:
- Admin operations are already behind authentication
- Service role provides full flexibility
- Less complexity in RLS policy management

#### 5. **Testing Checklist**

When implementing admin features:

- [ ] Authentication works (user can log in)
- [ ] Bearer token is sent correctly
- [ ] Token verification succeeds
- [ ] Admin check returns the correct user
- [ ] Database operations succeed
- [ ] Storage operations succeed
- [ ] Appropriate error messages for each failure point
- [ ] Service role key is never exposed to client

#### 6. **Debugging RLS Issues**

Add detailed logging to identify where the issue occurs:

```typescript
console.log('User authenticated:', user.email)
console.log('User ID:', user.id)

const { data: adminUser, error: adminError } = await supabaseAdmin
  .from('admin_users')
  .select('*')
  .eq('auth_id', user.id)
  .eq('is_active', true)
  .single()

console.log('Admin query result:', { adminUser, adminError })
```

This helps identify:
- Is the user authenticated? ✅
- What's their user ID? ✅
- Does the admin query work? ❌ (0 rows returned)
- What's the error? (PGRST116 - RLS blocking)

## Environment Variables Required

Ensure these are set in `.env.local`:

```env
# Anon key - for client-side and user operations
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service role key - for admin operations (server-side only)
SUPABASE_SERVICE_KEY=your-service-role-key
```

⚠️ **Never commit `.env.local` to version control**

## Related Documentation

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Service Role](https://supabase.com/docs/guides/auth/managing-user-data#service-role-key)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Summary

**The Issue**: RLS policies blocked admin operations when using the anon key

**The Fix**: Use service role key for admin operations after verifying user authentication

**Prevention**: Always use service role for admin-only server-side operations, but verify authentication first

---

*Last Updated: October 20, 2025*
