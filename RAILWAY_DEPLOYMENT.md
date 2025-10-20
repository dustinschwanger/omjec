# Railway Deployment Guide - OhioMeansJobs Huron County

Complete step-by-step guide to deploy this Next.js application to Railway.

## Prerequisites

Before deploying, ensure you have:

1. ✅ **Railway Account** - Sign up at [railway.app](https://railway.app)
2. ✅ **GitHub Repository** - Code is pushed to https://github.com/dustinschwanger/omjec.git
3. ✅ **Supabase Project** - Database and auth configured
4. ✅ **Pinecone Account** - Vector database index created
5. ✅ **OpenAI API Key** - For GPT-4 and embeddings
6. ✅ **Custom Domain** (optional) - For production URL

## Step 1: Create New Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose the repository: `dustinschwanger/omjec`
5. Railway will auto-detect Next.js and configure build settings

## Step 2: Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add all of these:

### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Pinecone Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=huron-county-chat
PINECONE_INDEX_HOST=your-index-host.pinecone.io

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
OPENAI_CHAT_MODEL=gpt-4o-mini

# Site Configuration (UPDATE THIS!)
NEXT_PUBLIC_SITE_URL=https://your-app.railway.app
```

**Important:**
- Get your Supabase values from: https://supabase.com/dashboard → Project Settings → API
- Get your Pinecone values from: https://www.pinecone.io → Your Index → Connect
- Get your OpenAI key from: https://platform.openai.com/api-keys
- Update `NEXT_PUBLIC_SITE_URL` with your actual Railway URL after deployment

## Step 3: Deploy

Railway will automatically:
1. Install dependencies (`npm install`)
2. Build the application (`npm run build`)
3. Start the server (`npm start`)

Watch the build logs in the Railway dashboard. First build typically takes 2-5 minutes.

## Step 4: Update Site URL

After initial deployment:

1. Note your Railway URL (e.g., `https://your-app.railway.app`)
2. Update the `NEXT_PUBLIC_SITE_URL` environment variable
3. Trigger a redeploy (Railway → Settings → Redeploy)

## Step 5: Database Migration

Run the analytics migration in Supabase SQL Editor:

```sql
-- Add analytics fields if not already present
ALTER TABLE chat_analytics ADD COLUMN IF NOT EXISTS word_count INTEGER;
ALTER TABLE chat_analytics ADD COLUMN IF NOT EXISTS has_web_search BOOLEAN DEFAULT FALSE;

-- Create admin analytics read policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'chat_analytics'
    AND policyname = 'Admins can read analytics'
  ) THEN
    CREATE POLICY "Admins can read analytics"
      ON chat_analytics FOR SELECT
      USING (
        auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true)
      );
  END IF;
END $$;
```

Or run the migration file: `supabase-analytics-migration.sql`

## Step 6: Configure Custom Domain (Optional)

### In Railway:

1. Go to your project → Settings → Domains
2. Click "Custom Domain"
3. Enter your domain (e.g., `huroncountymeansjobs.com`)
4. Railway will provide DNS records

### In Your DNS Provider:

Add the CNAME record provided by Railway:
```
Type: CNAME
Name: @ (or subdomain)
Value: [provided by Railway]
```

Wait for DNS propagation (can take up to 48 hours, usually 5-30 minutes).

### Update Environment Variable:

```bash
NEXT_PUBLIC_SITE_URL=https://huroncountymeansjobs.com
```

Redeploy after updating.

## Step 7: Upload Initial Documents

1. Navigate to `https://your-site.com/admin/login`
2. Log in with your admin credentials
3. Upload documents through the admin panel
4. Documents will be automatically processed and embedded in Pinecone

## Step 8: Test Everything

### Test Chat Widget:
- Go to homepage
- Open chat widget (bottom right)
- Ask questions about jobs, training, etc.
- Verify responses are contextual

### Test Admin Panel:
- Login at `/admin/login`
- Upload a test document
- Check processing status
- View analytics at `/admin/analytics`

### Test Document Downloads:
- Upload a downloadable document
- Ask the chat about it
- Verify download link appears in response
- Click download link and check tracking

## Troubleshooting

### Build Fails

**Error:** `Module not found`
- **Solution:** Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error:** `Environment variable missing`
- **Solution:** Double-check all env vars in Railway dashboard
- Ensure no typos in variable names

### Chat Not Working

**Error:** Chat sends but no response
- **Solution:** Check OpenAI API key is valid
- Verify Pinecone index is created and accessible
- Check Railway logs for errors

**Error:** "Document chunks not found"
- **Solution:** Upload documents through admin panel
- Verify document processing completed successfully
- Check Pinecone index has vectors

### Admin Panel Issues

**Error:** "Not authorized"
- **Solution:** Verify admin user exists in Supabase
- Run `create-admin-user.sql` script
- Check RLS policies are correct

**Error:** Document upload fails
- **Solution:** Verify Supabase storage bucket exists
- Check storage policies allow admin uploads
- Ensure file size is under limits

### Analytics Not Showing

**Error:** Dashboard is empty
- **Solution:** Have some chat conversations first
- Run analytics migration SQL
- Check RLS policy allows admin to read analytics

## Performance Optimization

### After Deployment:

1. **Enable Railway Metrics** - Monitor performance
2. **Set up Error Tracking** - Use Sentry or similar
3. **Configure Caching** - Railway handles this automatically
4. **Monitor Costs** - Check OpenAI and Pinecone usage

## Environment-Specific Settings

### Railway Auto-Detected:
- ✅ Node.js version (from `.nvmrc` or package.json)
- ✅ Build command (`npm run build`)
- ✅ Start command (`npm start`)
- ✅ Port (Next.js uses `$PORT` by default)

### No Additional Configuration Needed:
- Railway automatically handles SSL/HTTPS
- CDN and edge caching included
- Health checks configured automatically

## Monitoring

### Railway Dashboard:
- **Deployments** - View build history and logs
- **Metrics** - CPU, memory, bandwidth usage
- **Logs** - Real-time application logs

### External Monitoring:
- **Supabase Dashboard** - Database queries and usage
- **Pinecone Console** - Vector operations and costs
- **OpenAI Dashboard** - API usage and costs

## Scaling

### Vertical Scaling:
Railway Pro plan allows:
- More RAM
- More CPU cores
- Higher bandwidth limits

### Horizontal Scaling:
For high traffic:
- Consider Vercel or Cloudflare Workers for edge deployment
- Use Redis for session caching
- Implement rate limiting

## Security Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Supabase RLS policies enabled and tested
- [ ] Admin panel password is strong
- [ ] CORS configured (if needed)
- [ ] Rate limiting considered for APIs
- [ ] Error messages don't expose sensitive info
- [ ] Logs don't contain API keys or secrets

## Cost Estimates

### Railway:
- **Hobby Plan:** $5/month (500 hours)
- **Pro Plan:** $20/month + usage

### External Services:
- **Supabase Free Tier:** $0/month (500MB database, 1GB storage)
- **Pinecone Starter:** $0/month (1 index, 100k vectors)
- **OpenAI:** Pay-per-use (~$0.10-1.00 per 1000 queries depending on usage)

**Estimated Total:** $5-30/month depending on traffic

## Support

### If You Need Help:

1. **Railway Docs:** https://docs.railway.app
2. **Next.js Docs:** https://nextjs.org/docs
3. **Supabase Docs:** https://supabase.com/docs
4. **Pinecone Docs:** https://docs.pinecone.io

### Common Resources:

- Railway Discord: https://discord.gg/railway
- Supabase Discord: https://discord.supabase.com
- Next.js Discord: https://nextjs.org/discord

## Post-Deployment Checklist

- [ ] Site loads correctly at production URL
- [ ] Chat widget works and returns contextual responses
- [ ] Admin login works
- [ ] Document upload and processing works
- [ ] Analytics dashboard displays data
- [ ] Download links work and tracking increments
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Environment variables all set
- [ ] Database migration completed
- [ ] Initial documents uploaded
- [ ] Monitoring configured

## Success! 🎉

Your OhioMeansJobs Huron County website is now live on Railway!

**Next Steps:**
1. Share the site with stakeholders
2. Monitor analytics to understand user needs
3. Upload additional helpful documents
4. Iterate based on user feedback

---

**Deployment Date:** _________________

**Production URL:** https://___________________

**Admin Email:** ____________________

**Notes:** _______________________________
