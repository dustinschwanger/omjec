# Admin Panel Setup Guide

## Creating Your First Admin User

To access the admin panel at `/admin/login`, you need to create an admin user in Supabase.

### Steps:

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard

2. **Fix the RLS policy** (IMPORTANT - Do this first!):
   - Go to **SQL Editor** in the left sidebar
   - Run the SQL script in `fix-admin-users-rls.sql`
   - This allows authenticated users to check their admin status

3. **Navigate to Authentication**:
   - Click on **Authentication** in the left sidebar
   - Click on **Users**

4. **Create a new user**:
   - Click **Add user** → **Create new user**
   - Enter an email address and password
   - Click **Create user**
   - **Copy the User ID** (you'll need this in the next step)

5. **Add user to admin_users table**:
   - Go to **Table Editor** in the left sidebar
   - Select the `admin_users` table
   - Click **Insert** → **Insert row**
   - Fill in the fields:
     - `auth_id`: Paste the User ID you copied from step 4
     - `email`: Same email you used in step 4
     - `is_active`: Check this box (set to TRUE)
   - Click **Save**

6. **Test the login**:
   - Go to http://localhost:3000/admin/login
   - Enter the email and password you created
   - You should be redirected to the admin dashboard

## Admin Panel Features

Once logged in, you'll have access to:

- **Dashboard**: Overview of documents and chat analytics
- **Document Management**: Upload, view, and delete documents
- **Document Upload**: Add PDFs, Word docs, images for the AI chat
- **Chat Analytics**: Monitor chat usage and popular queries

## What's Next?

### Current Status:
- ✅ Admin login page created
- ✅ Admin dashboard layout complete
- ⏳ Document upload interface (Phase 6.4 - In Progress)
- ⏳ Document processing system (Phase 7)

### Coming Soon (Phase 7):
The document upload and processing system will:
1. Accept PDF, Word, image files
2. Extract text content (with OCR for images)
3. Split into chunks for better search
4. Generate embeddings using OpenAI
5. Store in Pinecone vector database
6. Make documents searchable by the chat widget

### Testing the Chat:
The chat widget is already working! Try it on the homepage:
- Click the floating chat button (bottom-right)
- Ask questions like:
  - "What services do you offer?"
  - "Tell me about the youth program"
  - "How can I get job search help?"

Right now it answers based on:
- The system prompt (basic info about OhioMeansJobs)
- AI's general knowledge

Once you upload documents in Phase 7, it will also pull information from your uploaded files!

## Security Notes

- Admin routes are protected by authentication
- Only users in the `admin_users` table with `is_active=true` can access admin pages
- Passwords are securely hashed by Supabase
- Service keys are never exposed to the browser

## Troubleshooting

### "Database error querying schema" on login

**Problem:** The admin_users table has Row Level Security (RLS) enabled but no policy allowing users to read their own admin status.

**Solution:** Run the `fix-admin-users-rls.sql` script in your Supabase SQL Editor:

```sql
CREATE POLICY "Users can read own admin status"
  ON admin_users FOR SELECT
  USING (auth.uid() = auth_id);
```

This policy allows authenticated users to check if they have an entry in the admin_users table, which is necessary for the login flow to work.

### Login page loads but nothing happens

Check your browser console (F12) for errors. Common issues:
- RLS policy not applied (see above)
- Supabase environment variables not set
- Network errors connecting to Supabase

### Can't see admin dashboard after login

The dashboard checks both:
1. User is authenticated (has valid session)
2. User exists in admin_users table with is_active=true

Make sure both conditions are met.
