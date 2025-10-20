# Railway Deployment Checklist

Quick reference checklist for deploying to Railway. See `RAILWAY_DEPLOYMENT.md` for detailed instructions.

## Pre-Deployment

### Repository
- [x] Code pushed to GitHub (https://github.com/dustinschwanger/omjec.git)
- [x] `.gitignore` configured (excludes .env, node_modules, .next, etc.)
- [x] Large files excluded (video files > 100MB in .gitignore)

### Configuration Files
- [x] `package.json` - Build and start scripts configured
- [x] `next.config.js` - Production optimizations added
- [x] `railway.json` - Railway-specific configuration
- [x] `.env.example` - All required env vars documented

### External Services Ready
- [ ] **Supabase Project Created**
  - Database tables created (`supabase-schema.sql`)
  - Storage bucket configured
  - RLS policies enabled
  - Admin user created

- [ ] **Pinecone Index Created**
  - Index name: `huron-county-chat`
  - Dimensions: 1536
  - Metric: cosine

- [ ] **OpenAI API Key**
  - Account created
  - Billing configured
  - API key generated

## Railway Setup

### Step 1: Create Project
- [ ] Log in to Railway
- [ ] Create new project from GitHub
- [ ] Select repository: `dustinschwanger/omjec`
- [ ] Wait for initial detection

### Step 2: Environment Variables

Copy these to Railway → Variables:

```bash
# REQUIRED - Update with your actual values
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
PINECONE_API_KEY=
PINECONE_INDEX_NAME=huron-county-chat
PINECONE_INDEX_HOST=
OPENAI_API_KEY=
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
OPENAI_CHAT_MODEL=gpt-4o-mini
NEXT_PUBLIC_SITE_URL=https://your-app.railway.app
```

- [ ] All environment variables added
- [ ] Values verified (no typos)
- [ ] `NEXT_PUBLIC_SITE_URL` set to Railway URL

### Step 3: Deploy
- [ ] Trigger first deployment
- [ ] Monitor build logs
- [ ] Wait for deployment to complete (2-5 min)
- [ ] Note the Railway URL

### Step 4: Post-Deployment
- [ ] Update `NEXT_PUBLIC_SITE_URL` with actual Railway URL
- [ ] Redeploy with updated URL

## Database Migration

- [ ] Run in Supabase SQL Editor:
  ```sql
  -- See supabase-analytics-migration.sql
  ALTER TABLE chat_analytics ADD COLUMN IF NOT EXISTS word_count INTEGER;
  ALTER TABLE chat_analytics ADD COLUMN IF NOT EXISTS has_web_search BOOLEAN DEFAULT FALSE;
  ```

## Testing

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] Chat widget appears and opens
- [ ] Chat sends messages
- [ ] Chat receives contextual responses
- [ ] Admin login works (`/admin/login`)
- [ ] Admin dashboard loads
- [ ] Document upload works
- [ ] Document processing completes
- [ ] Analytics dashboard displays (`/admin/analytics`)
- [ ] Download links work in chat
- [ ] Download tracking increments

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Chat response time < 5 seconds
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SSL certificate active (https)

## Optional: Custom Domain

### DNS Configuration
- [ ] Domain purchased
- [ ] DNS provider accessible
- [ ] Add Railway CNAME record
- [ ] Wait for DNS propagation (5-30 min)

### Railway Configuration
- [ ] Add custom domain in Railway settings
- [ ] Verify domain is active
- [ ] Update `NEXT_PUBLIC_SITE_URL` to custom domain
- [ ] Redeploy

## Post-Launch

### Initial Setup
- [ ] Upload initial documents through admin panel
- [ ] Test chat with uploaded documents
- [ ] Verify analytics are being tracked

### Monitoring
- [ ] Railway dashboard bookmarked
- [ ] Supabase dashboard access verified
- [ ] OpenAI usage dashboard checked
- [ ] Pinecone usage dashboard checked

### Documentation
- [ ] Admin credentials saved securely
- [ ] Environment variables backed up
- [ ] Deployment date recorded
- [ ] Production URL documented

## Success Criteria

All items checked = Ready for production! ✅

**Deployment Date:** _________________

**Production URL:** _________________

**Admin Email:** _________________

**Notes:**
___________________________________________
___________________________________________
___________________________________________
