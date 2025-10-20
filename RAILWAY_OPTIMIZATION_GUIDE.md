# Railway Deployment Optimization Guide

This guide documents best practices for deploying Next.js applications to Railway, based on real issues encountered and solved during deployment.

## Table of Contents
- [Build Configuration](#build-configuration)
- [Environment Variables & Client Initialization](#environment-variables--client-initialization)
- [Node Version Management](#node-version-management)
- [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## Build Configuration

### Problem 1: Overly Complex Build Commands

**Issue**: Build commands with multiple chained operations, debug output, and redundant dependency installations can cause builds to timeout or fail mysteriously.

**Bad Example**:
```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "echo '=== Build ===' && node -v && git rev-parse HEAD && npm ci && npm run build"
  }
}
```

**Why it fails**:
- Railpack already handles `npm ci` in its install step
- Running `npm ci` twice is redundant and wastes time
- Multiple echo/git commands add complexity
- Build can get canceled before reaching `npm run build`
- No `.next` directory generated → deployment fails

**Good Example**:
```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm run build"
  }
}
```

### Best Practices for railway.json

**Minimal configuration**:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Key principles**:
1. **Keep build commands simple** - Railpack handles dependency installation automatically
2. **Don't run `npm ci` or `npm install` in buildCommand** - Railpack does this in the install step
3. **Avoid debug output** - It adds complexity and can cause timeouts
4. **Trust Railpack** - It's designed to detect and build Node.js apps correctly

---

## Environment Variables & Client Initialization

### Problem 2: Module-Level Client Initialization

**Issue**: Third-party clients (Supabase, database connections, etc.) initialized at module import time will fail during Next.js build phase when environment variables aren't available.

**Error**:
```
Collecting page data ...
Error: supabaseUrl is required.
> Build error occurred
Error: Failed to collect page data for /api/...
```

**Why it happens**:
- Next.js imports all modules during build to analyze routes
- Environment variables may not be available during build phase
- Client creation at module level executes immediately on import
- Missing env vars → client initialization fails → build fails

### Solution: Lazy Initialization Pattern

**Bad Example** (module-level initialization):
```typescript
// ❌ DON'T: Initialized when module loads
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Good Example** (lazy initialization):
```typescript
// ✅ DO: Initialized only when accessed
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export const getSupabase = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not set')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Backward compatibility using Proxy
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    return getSupabase()[prop as keyof SupabaseClient]
  }
})
```

### Server-Side Admin Client Pattern

**Good Example**:
```typescript
export function getSupabaseAdmin() {
  // Prevent client-side usage
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin can only be called server-side')
  }

  // Get env vars at runtime, not module load time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set')
  }
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
```

### Key Principles for Client Initialization

1. **Never initialize clients at module level** - Use lazy initialization or factory functions
2. **Read env vars at runtime** - Not at module import time
3. **Provide clear error messages** - Help identify which env vars are missing
4. **Use singleton pattern** - Create client once, reuse for subsequent calls
5. **Validate env vars before creating client** - Fail fast with descriptive errors

### Applies to All Third-Party Services

This pattern works for any service that requires runtime configuration:

```typescript
// Database clients
let prismaClient: PrismaClient | null = null
export const getPrisma = () => { /* lazy init */ }

// Redis clients
let redisClient: Redis | null = null
export const getRedis = () => { /* lazy init */ }

// Email services
let emailClient: SendGrid | null = null
export const getEmailClient = () => { /* lazy init */ }

// Payment processors
let stripeClient: Stripe | null = null
export const getStripe = () => { /* lazy init */ }
```

---

## Node Version Management

### Problem 3: Railway Ignoring Node Version Config

**Issue**: Railway/Railpack sometimes ignores minor/patch version specifications in `.nvmrc` or `.node-version` files.

**Solution**: Use multiple standard methods to ensure proper Node version:

**1. Package.json engines field** (most reliable):
```json
{
  "engines": {
    "node": ">=20.16.0"
  }
}
```

**2. Version files** (use major version only):

`.nvmrc`:
```
20
```

`.node-version`:
```
20
```

**3. Railway environment variable** (if needed):
```
NIXPACKS_NODE_VERSION=20
```

### Best Practices

- **Use major version only** in `.nvmrc` and `.node-version` (e.g., `20` not `20.16.0`)
- **Use semver range** in `package.json` engines (e.g., `>=20.16.0`)
- **Don't specify minor/patch versions** in version files - Railway may ignore them
- **Trust Railpack** to select the latest stable version in that major range

---

## Troubleshooting Common Issues

### Build Succeeds but .next Directory Missing

**Symptoms**:
```
Error: Could not find a production build in the '.next' directory
```

**Causes & Solutions**:
1. **Build command not executing** → Simplify `railway.json` buildCommand
2. **Build command timing out** → Remove debug output and complex commands
3. **Wrong working directory** → Check Railway service settings

### Build Fails During "Collecting Page Data"

**Symptoms**:
```
Collecting page data ...
Error: [some client] is required
> Build error occurred
```

**Causes & Solutions**:
1. **Module-level client initialization** → Use lazy initialization pattern
2. **Missing env vars during build** → Move env var reads to runtime
3. **Database connection during build** → Use dynamic imports or lazy loading

### Environment Variables Not Available

**Check these in Railway dashboard**:
1. Variables are set in the correct environment (production/staging)
2. Variables are properly named (case-sensitive)
3. No typos in variable names
4. Values are properly quoted if they contain special characters

**Required for this project**:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# OpenAI
OPENAI_API_KEY=sk-...

# Pinecone
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=your-index-name
```

### Build is Using Wrong Code/Commit

**Symptoms**:
- Build logs show old code
- Recent fixes not appearing in deployment
- Stale errors for already-fixed issues

**Solutions**:
1. **Use "Deploy Latest Commit"** - Don't use "Redeploy" on old build
2. **Check Git SHA** in build logs matches your latest commit
3. **Add NO_CACHE=1 env var** temporarily to force clean build
4. **Remove NO_CACHE=1** after successful build

### Railway Builder Detection Issues

**If Railway picks wrong builder**:
1. Verify `railway.json` has `"builder": "RAILPACK"`
2. Check `package.json` has valid `scripts.build` command
3. Ensure `package-lock.json` or `yarn.lock` exists
4. Try deleting and recreating Railway service

---

## Quick Reference Checklist

Before deploying to Railway:

- [ ] `railway.json` buildCommand is simple (just `npm run build`)
- [ ] No module-level client initialization (use lazy loading)
- [ ] All env var reads happen at runtime, not import time
- [ ] Node version specified in `package.json` engines field
- [ ] `.nvmrc` uses major version only (e.g., `20`)
- [ ] All required environment variables set in Railway dashboard
- [ ] Local build succeeds with `npm run build`
- [ ] No hardcoded values that should be environment variables
- [ ] All third-party service clients use factory functions or lazy init

---

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railpack Configuration](https://docs.railway.app/guides/build-configuration#railpack)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Environment Variables in Next.js](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## Summary

The two most critical lessons for Railway deployment:

1. **Keep it simple** - Let Railpack handle the build process, don't overcomplicate the buildCommand
2. **Lazy initialization** - Never initialize third-party clients at module level; use runtime initialization patterns

Following these patterns will prevent 90% of Railway deployment issues and ensure smooth, reliable deployments.
