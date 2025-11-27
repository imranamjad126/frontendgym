-- ============================================
-- FIX ADMIN LOGIN ISSUE
-- ============================================
-- This script fixes common login issues:
-- 1. Verifies auth user exists
-- 2. Ensures users.id matches auth.users.id
-- 3. Updates role to OWNER (if ADMIN exists)
-- 4. Verifies RLS policies allow access
-- ============================================

-- ============================================
-- PART 1: VERIFY AUTH USER EXISTS
-- ============================================

DO $$
DECLARE
  super_admin_email TEXT := 'fitnesswithimran1@gmail.com';
  auth_user_id UUID;
  auth_user_exists BOOLEAN := false;
BEGIN
  -- Check if auth.users table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
      -- Check if auth user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = super_admin_email) INTO auth_user_exists;
    
    IF auth_user_exists THEN
      SELECT id INTO auth_user_id
      FROM auth.users 
      WHERE email = super_admin_email 
      LIMIT 1;
    END IF;
    
    IF auth_user_exists AND auth_user_id IS NOT NULL THEN
      RAISE NOTICE '✅ Auth user found: % (ID: %)', super_admin_email, auth_user_id;
    ELSE
      RAISE NOTICE '❌ Auth user NOT found: %', super_admin_email;
      RAISE NOTICE '⚠️ Please create auth user first:';
      RAISE NOTICE '   1. Go to Supabase Dashboard → Authentication → Users';
      RAISE NOTICE '   2. Click "Add User" → "Create new user"';
      RAISE NOTICE '   3. Email: %', super_admin_email;
      RAISE NOTICE '   4. Password: Aa543543@';
      RAISE NOTICE '   5. Auto Confirm User: YES';
      RAISE NOTICE '   6. Click "Create user"';
      RAISE NOTICE '   7. Then run this script again';
      RETURN;
    END IF;
  ELSE
    RAISE NOTICE '⚠️ auth.users table does not exist';
    RETURN;
  END IF;
END $$;

-- ============================================
-- PART 2: VERIFY AND FIX USERS TABLE RECORD
-- ============================================

DO $$
DECLARE
  super_admin_email TEXT := 'fitnesswithimran1@gmail.com';
  auth_user_id UUID;
  users_table_id UUID;
  role_mismatch BOOLEAN := false;
BEGIN
  -- Get auth user ID
  SELECT id INTO auth_user_id
  FROM auth.users 
  WHERE email = super_admin_email 
  LIMIT 1;
  
  IF auth_user_id IS NULL THEN
    RAISE NOTICE '⚠️ Auth user not found, skipping users table fix';
    RETURN;
  END IF;
  
  -- Check if users table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    RAISE NOTICE '⚠️ users table does not exist, please run migration script first';
    RETURN;
  END IF;
  
  -- Check if record exists in users table
  SELECT id INTO users_table_id
  FROM users 
  WHERE email = super_admin_email
  LIMIT 1;
  
  IF users_table_id IS NULL THEN
    -- Record doesn't exist, create it with auth user ID
    INSERT INTO users (id, email, role, gym_id)
    VALUES (auth_user_id, super_admin_email, 'OWNER'::user_role, NULL)
    ON CONFLICT (id) DO UPDATE 
    SET email = super_admin_email, role = 'OWNER'::user_role;
    
    RAISE NOTICE '✅ Created users table record with auth user ID';
  ELSIF users_table_id != auth_user_id THEN
    -- ID mismatch - this is the problem!
    RAISE NOTICE '❌ ID MISMATCH DETECTED!';
    RAISE NOTICE '   users.id: %', users_table_id;
    RAISE NOTICE '   auth.users.id: %', auth_user_id;
    RAISE NOTICE '   Fixing by updating users.id to match auth.users.id...';
    
    -- Delete old record
    DELETE FROM users WHERE email = super_admin_email;
    
    -- Insert with correct auth user ID
    INSERT INTO users (id, email, role, gym_id)
    VALUES (auth_user_id, super_admin_email, 'OWNER'::user_role, NULL);
    
    RAISE NOTICE '✅ Fixed ID mismatch - users.id now matches auth.users.id';
  ELSE
    -- ID matches, check role
    IF EXISTS (
      SELECT 1 FROM users 
      WHERE email = super_admin_email 
      AND (role::text = 'ADMIN' OR role::text != 'OWNER')
    ) THEN
      -- Update role from ADMIN to OWNER
      UPDATE users 
      SET role = 'OWNER'::user_role 
      WHERE email = super_admin_email;
      
      RAISE NOTICE '✅ Updated role from ADMIN to OWNER';
    ELSE
      RAISE NOTICE '✅ users table record is correct (ID matches, role is OWNER)';
    END IF;
  END IF;
END $$;

-- ============================================
-- PART 3: VERIFY RLS POLICIES ALLOW ACCESS
-- ============================================

DO $$
DECLARE
  super_admin_email TEXT := 'fitnesswithimran1@gmail.com';
  auth_user_id UUID;
  policy_count INTEGER := 0;
BEGIN
  -- Get auth user ID
  SELECT id INTO auth_user_id
  FROM auth.users 
  WHERE email = super_admin_email 
  LIMIT 1;
  
  IF auth_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if Super Admin policy exists for users table
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'users' 
  AND policyname LIKE '%Super Admin%';
  
  IF policy_count = 0 THEN
    RAISE NOTICE '⚠️ Super Admin RLS policy not found for users table';
    RAISE NOTICE '   This might block login. Creating policy...';
    
    -- Create Super Admin policy if it doesn't exist
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
      CREATE POLICY IF NOT EXISTS "Super Admin can manage all users"
      ON users FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fitnesswithimran1@gmail.com')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fitnesswithimran1@gmail.com')
      );
      
      RAISE NOTICE '✅ Created Super Admin RLS policy for users table';
    END IF;
  ELSE
    RAISE NOTICE '✅ Super Admin RLS policy exists for users table';
  END IF;
END $$;

-- ============================================
-- PART 4: FINAL VERIFICATION
-- ============================================

DO $$
DECLARE
  super_admin_email TEXT := 'fitnesswithimran1@gmail.com';
  auth_user_id UUID;
  users_table_id UUID;
  users_role TEXT;
  id_match BOOLEAN := false;
  role_correct BOOLEAN := false;
BEGIN
  -- Get auth user ID
  SELECT id INTO auth_user_id
  FROM auth.users 
  WHERE email = super_admin_email 
  LIMIT 1;
  
  -- Get users table record
  SELECT id, role::text INTO users_table_id, users_role
  FROM users 
  WHERE email = super_admin_email
  LIMIT 1;
  
  IF auth_user_id IS NULL THEN
    RAISE NOTICE '❌ VERIFICATION FAILED: Auth user not found';
    RETURN;
  END IF;
  
  IF users_table_id IS NULL THEN
    RAISE NOTICE '❌ VERIFICATION FAILED: users table record not found';
    RETURN;
  END IF;
  
  -- Check ID match
  IF users_table_id = auth_user_id THEN
    id_match := true;
    RAISE NOTICE '✅ ID Match: users.id = auth.users.id = %', auth_user_id;
  ELSE
    RAISE NOTICE '❌ ID Mismatch: users.id = %, auth.users.id = %', users_table_id, auth_user_id;
  END IF;
  
  -- Check role
  IF users_role = 'OWNER' THEN
    role_correct := true;
    RAISE NOTICE '✅ Role Correct: OWNER';
  ELSE
    RAISE NOTICE '❌ Role Incorrect: % (should be OWNER)', users_role;
  END IF;
  
  -- Final status
  IF id_match AND role_correct THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅✅✅ VERIFICATION PASSED ✅✅✅';
    RAISE NOTICE '   Auth user: EXISTS';
    RAISE NOTICE '   users.id matches auth.users.id: YES';
    RAISE NOTICE '   Role: OWNER';
    RAISE NOTICE '   Login should work now!';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '❌❌❌ VERIFICATION FAILED ❌❌❌';
    RAISE NOTICE '   Please check the issues above and fix them.';
    RAISE NOTICE '';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERY (Run separately to check)
-- ============================================

SELECT 
  'Auth User Check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com') 
    THEN '✅ EXISTS' 
    ELSE '❌ NOT FOUND' 
  END as status,
  (SELECT id FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1) as auth_user_id;

SELECT 
  'Users Table Check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM users WHERE email = 'fitnesswithimran1@gmail.com') 
    THEN '✅ EXISTS' 
    ELSE '❌ NOT FOUND' 
  END as status,
  (SELECT id FROM users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1) as users_table_id,
  (SELECT role::text FROM users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1) as role;

SELECT 
  'ID Match Check' as check_type,
  CASE 
    WHEN (SELECT id FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1) = 
         (SELECT id FROM users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1)
    THEN '✅ MATCH' 
    ELSE '❌ MISMATCH' 
  END as status,
  (SELECT id FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1) as auth_id,
  (SELECT id FROM users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1) as users_id;

