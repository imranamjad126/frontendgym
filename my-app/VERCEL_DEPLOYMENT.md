# Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Supabase project set up and running

## Step 1: Push Code to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit with Supabase integration"
```

2. Create a new repository on GitHub

3. Push your code:
```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name? **frontendgym** (or your preferred name)
   - Directory? **./my-app** (or just **.** if you're in the my-app folder)
   - Override settings? **No**

## Step 3: Environment Variables

### Important: Add Supabase Keys

1. In Vercel dashboard, go to your project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

**For Production:**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://zoddbringdphqyrkwpfe.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZGRicmluZ2RwaHF5cmt3cGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTQ3MDAsImV4cCI6MjA3OTYzMDcwMH0.U3W-u_poRkgS90r7_OUZYnFoFlwxpLDCkrChhn32nvg`

**For Preview/Development (optional, same values):**
- Add the same variables for Preview and Development environments

4. **Update `lib/supabase.ts` to use environment variables:**

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zoddbringdphqyrkwpfe.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZGRicmluZ2RwaHF5cmt3cGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTQ3MDAsImV4cCI6MjA3OTYzMDcwMH0.U3W-u_poRkgS90r7_OUZYnFoFlwxpLDCkrChhn32nvg"
);
```

## Step 4: Update Supabase Configuration

### Enable CORS for Vercel Domain

1. Go to Supabase Dashboard → Settings → API
2. Add your Vercel domain to allowed origins (if needed)
3. Supabase usually allows all origins by default, but verify if you have issues

### Database Setup

Ensure your Supabase database has the `members` table with the following structure:

```sql
CREATE TABLE members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  plan TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL,
  gender TEXT,
  fee_amount NUMERIC,
  fee_paid BOOLEAN DEFAULT false,
  fee_paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at DATE,
  frozen_date DATE
);
```

### Row Level Security (RLS)

For public access (development):
```sql
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon users"
ON members
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
```

For production, create more restrictive policies based on your needs.

## Step 5: Redeploy After Environment Variables

After adding environment variables:
1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click **Redeploy**

Or push a new commit to trigger automatic redeployment.

## Step 6: Verify Deployment

1. Visit your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
2. Test adding a member
3. Check Supabase dashboard to verify data is being saved
4. Test fetching members
5. Test updating/deleting members

## Troubleshooting

### Build Errors

If you get build errors:
1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Check for TypeScript errors locally first

### Environment Variables Not Working

1. Ensure variables start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding variables
3. Check variable names match exactly

### Supabase Connection Issues

1. Verify Supabase URL and key are correct
2. Check Supabase dashboard for API status
3. Verify RLS policies allow your operations
4. Check browser console for CORS errors

### Database Errors

1. Verify table structure matches the code
2. Check column names match (snake_case in DB, camelCase in code)
3. Verify data types match

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## Continuous Deployment

Vercel automatically deploys:
- Every push to `main` branch → Production
- Every push to other branches → Preview deployment
- Every pull request → Preview deployment

## Monitoring

- View deployment logs in Vercel dashboard
- Check Supabase logs for database operations
- Use Vercel Analytics for performance monitoring

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs



