# Vercel Deployment Setup with Supabase

## Problem
Agar Vercel par deploy ke baad login nahi ho raha, to environment variables set nahi hain.

## Solution: Vercel me Environment Variables Set Karein

### Step 1: Vercel Dashboard me Environment Variables Add Karein

1. **Vercel Dashboard kholen:**
   - https://vercel.com/dashboard
   - Apna project select karein: `mynew-frontendgym`

2. **Settings → Environment Variables:**
   - Project page par "Settings" click karein
   - Left sidebar me "Environment Variables" click karein

3. **Add these 2 variables:**

   **Variable 1:**
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://zoddbringdphqyrkwpfe.supabase.co
   Environment: Production, Preview, Development (sab select karein)
   ```

   **Variable 2:**
   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZGRicmluZ2RwaHF5cmt3cGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTQ3MDAsImV4cCI6MjA3OTYzMDcwMH0.U3W-u_poRkgS90r7_OUZYnFoFlwxpLDCkrChhn32nvg
   Environment: Production, Preview, Development (sab select karein)
   ```

4. **Save karein** - Har variable ke liye "Add" button click karein

### Step 2: Redeploy Karein

1. Vercel Dashboard me "Deployments" tab par jayein
2. Latest deployment ke right side "..." menu click karein
3. "Redeploy" select karein
4. Wait karein deployment complete hone tak

### Step 3: Verify

1. Browser me jayein: https://mynew-frontendgym.vercel.app/
2. Login page par jayein
3. Ab Supabase connection kaam karega

## Alternative: Vercel CLI se Set Karein

Agar CLI use karna chahte ho:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Link project
cd my-app
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter value: https://zoddbringdphqyrkwpfe.supabase.co
# Select environments: Production, Preview, Development

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Enter value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZDBicmluZ2RwaHF5cmt3cGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTQ3MDAsImV4cCI6MjA3OTYzMDcwMH0.U3W-u_poRkgS90r7_OUZYnFoFlwxpLDCkrChhn32nvg
# Select environments: Production, Preview, Development

# Redeploy
vercel --prod
```

## Important Notes

1. ✅ **Environment Variables Public Hain:**
   - `NEXT_PUBLIC_*` variables browser me accessible hain
   - Ye safe hain kyunki ye Supabase anon key hai (public)

2. ✅ **Supabase RLS Policies:**
   - Supabase me Row Level Security (RLS) enabled hai
   - Sirf authenticated users hi data access kar sakte hain

3. ✅ **Admin User Setup:**
   - Vercel par deploy ke baad bhi admin user Supabase me create karna hoga
   - Follow: `ADMIN_SETUP_STEPS.txt` ya `QUICK_ADMIN_SETUP.md`

## Troubleshooting

### ❌ Still getting "Invalid login credentials"?

1. Check environment variables set hain:
   - Vercel Dashboard → Settings → Environment Variables
   - Dono variables dikhni chahiye

2. Redeploy karein:
   - Environment variables add karne ke baad redeploy zaroori hai

3. Check Supabase connection:
   - Browser console me errors check karein
   - Network tab me Supabase requests check karein

4. Verify admin user exists:
   - Supabase Dashboard → Authentication → Users
   - User create karein agar nahi hai

### ❌ "Supabase client not initialized"?

- Environment variables missing hain
- Redeploy karein after adding variables

### ❌ CORS errors?

- Supabase Dashboard → Settings → API
- Check "Allowed Origins" me Vercel URL add hai:
  - `https://mynew-frontendgym.vercel.app`
  - `https://*.vercel.app` (for preview deployments)

## Quick Checklist

- [ ] Environment variables Vercel me set hain
- [ ] Redeploy ho chuka hai
- [ ] Admin user Supabase me create ho chuka hai
- [ ] Email confirmed hai
- [ ] users table me record hai
- [ ] CORS settings correct hain

## Next Steps

1. Environment variables set karein (Step 1)
2. Redeploy karein (Step 2)
3. Admin user create karein (Supabase Dashboard)
4. Login test karein

