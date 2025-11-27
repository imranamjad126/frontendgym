# Quick Admin Setup Guide

## Problem: "Invalid login credentials" Error

This error means the admin user doesn't exist in Supabase Auth yet.

## Solution: Create Admin User

### Method 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project

2. **Create Auth User**
   - Go to: **Authentication** → **Users**
   - Click: **"Add User"** → **"Create new user"**
   - Fill in:
     - **Email**: `fitnesswithimran1@gmail.com`
     - **Password**: `Aa543543@`
     - **Auto Confirm User**: ✅ **Yes** (IMPORTANT!)
   - Click: **"Create user"**
   - **Copy the User ID** (you'll need it)

3. **Create User Record in Database**
   - Go to: **SQL Editor** → **New Query**
   - Run this SQL:
   ```sql
   INSERT INTO users (id, email, role, gym_id)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com'),
     'fitnesswithimran1@gmail.com',
     'ADMIN',
     NULL
   )
   ON CONFLICT (id) DO UPDATE
   SET role = 'ADMIN', gym_id = NULL;
   ```

4. **Verify**
   - Run: `SELECT * FROM users WHERE email = 'fitnesswithimran1@gmail.com';`
   - Should show: role = 'ADMIN', gym_id = NULL

5. **Login**
   - Go to: `http://localhost:3000/login`
   - Email: `fitnesswithimran1@gmail.com`
   - Password: `Aa543543@`

### Method 2: Using Setup Page (If available)

1. Go to: `http://localhost:3000/setup-admin`
2. Click "Create Admin User"
3. If it fails, use Method 1 above

### Method 3: Using Supabase SQL (Advanced)

Run this in SQL Editor (creates user via SQL):

```sql
-- First, ensure the auth user exists (if not, create via Dashboard)
-- Then run this to create/update the users table record:

DO $$
DECLARE
  auth_user_id UUID;
BEGIN
  -- Get the auth user ID
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'fitnesswithimran1@gmail.com';
  
  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth user not found. Please create user in Authentication → Users first.';
  END IF;
  
  -- Insert or update users table
  INSERT INTO users (id, email, role, gym_id)
  VALUES (auth_user_id, 'fitnesswithimran1@gmail.com', 'ADMIN', NULL)
  ON CONFLICT (id) DO UPDATE
  SET role = 'ADMIN', gym_id = NULL;
  
  RAISE NOTICE 'Admin user created successfully!';
END $$;
```

## Troubleshooting

### Still getting "Invalid login credentials"?
1. ✅ Check email is correct: `fitnesswithimran1@gmail.com`
2. ✅ Check password is correct: `Aa543543@`
3. ✅ Verify user exists: Go to Authentication → Users, search for email
4. ✅ Check email is confirmed: User should have green checkmark
5. ✅ Verify users table record: Run `SELECT * FROM users WHERE email = 'fitnesswithimran1@gmail.com';`

### User exists but can't login?
- Check if email is confirmed in Authentication → Users
- Try resetting password in Supabase Dashboard
- Check browser console for detailed errors

### Database not set up?
- Run `supabase/01-multi-user-setup.sql` first in SQL Editor



