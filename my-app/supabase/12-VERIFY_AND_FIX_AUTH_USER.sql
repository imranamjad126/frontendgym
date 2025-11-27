-- ============================================
-- VERIFY AND FIX AUTH USER FOR LOGIN
-- ============================================
-- This script verifies auth user exists and is confirmed
-- Note: Cannot directly create/update auth.users via SQL
-- Use Supabase Dashboard or Admin API instead
-- ============================================

-- ============================================
-- PART 1: CHECK AUTH USER STATUS
-- ============================================

DO $$
DECLARE
  super_admin_email TEXT := 'fitnesswithimran1@gmail.com';
  auth_user_id UUID;
  auth_user_confirmed BOOLEAN := false;
  auth_user_exists BOOLEAN := false;
BEGIN
  -- Check if auth.users table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    -- Check if auth user exists
    SELECT 
      id,
      CASE WHEN confirmed_at IS NOT NULL THEN true ELSE false END,
      EXISTS(SELECT 1)
    INTO auth_user_id, auth_user_confirmed, auth_user_exists
    FROM auth.users 
    WHERE email = super_admin_email 
    LIMIT 1;
    
    IF auth_user_exists AND auth_user_id IS NOT NULL THEN
      IF auth_user_confirmed THEN
        RAISE NOTICE '✅ Auth user EXISTS and CONFIRMED: % (ID: %)', super_admin_email, auth_user_id;
      ELSE
        RAISE NOTICE '⚠️ Auth user EXISTS but NOT CONFIRMED: %', super_admin_email;
        RAISE NOTICE '   Please confirm email in Supabase Dashboard:';
        RAISE NOTICE '   1. Go to Authentication → Users';
        RAISE NOTICE '   2. Find user: %', super_admin_email;
        RAISE NOTICE '   3. Click on user → Set "Email Confirmed" = TRUE';
      END IF;
    ELSE
      RAISE NOTICE '❌ Auth user NOT FOUND: %', super_admin_email;
      RAISE NOTICE '';
      RAISE NOTICE '⚠️ ACTION REQUIRED: Create auth user manually';
      RAISE NOTICE '';
      RAISE NOTICE 'Method 1: Supabase Dashboard (Recommended)';
      RAISE NOTICE '   1. Go to Supabase Dashboard → Authentication → Users';
      RAISE NOTICE '   2. Click "Add User" → "Create new user"';
      RAISE NOTICE '   3. Email: %', super_admin_email;
      RAISE NOTICE '   4. Password: Aa543543@';
      RAISE NOTICE '   5. Auto Confirm User: ✅ YES (IMPORTANT!)';
      RAISE NOTICE '   6. Click "Create user"';
      RAISE NOTICE '';
      RAISE NOTICE 'Method 2: Use Frontend Tool';
      RAISE NOTICE '   Visit: /login-diagnostic';
      RAISE NOTICE '   Click: "Create Admin User" button';
      RAISE NOTICE '';
      RAISE NOTICE 'After creating auth user, run this script again.';
      RETURN;
    END IF;
  ELSE
    RAISE NOTICE '⚠️ auth.users table does not exist';
    RETURN;
  END IF;
END $$;

-- ============================================
-- PART 2: VERIFY USERS TABLE RECORD MATCHES
-- ============================================

DO $$
DECLARE
  super_admin_email TEXT := 'fitnesswithimran1@gmail.com';
  auth_user_id UUID;
  users_table_id UUID;
  users_role TEXT;
BEGIN
  -- Get auth user ID
  SELECT id INTO auth_user_id
  FROM auth.users 
  WHERE email = super_admin_email 
  LIMIT 1;
  
  IF auth_user_id IS NULL THEN
    RAISE NOTICE '⚠️ Auth user not found, skipping users table check';
    RETURN;
  END IF;
  
  -- Check users table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    RAISE NOTICE '⚠️ users table does not exist';
    RETURN;
  END IF;
  
  -- Get users table record
  SELECT id, role::text INTO users_table_id, users_role
  FROM users 
  WHERE email = super_admin_email
  LIMIT 1;
  
  IF users_table_id IS NULL THEN
    -- Create record with auth user ID
    INSERT INTO users (id, email, role, gym_id)
    VALUES (auth_user_id, super_admin_email, 'OWNER'::user_role, NULL)
    ON CONFLICT (id) DO UPDATE 
    SET email = super_admin_email, role = 'OWNER'::user_role;
    
    RAISE NOTICE '✅ Created users table record with auth user ID';
  ELSIF users_table_id != auth_user_id THEN
    -- ID mismatch - fix it
    RAISE NOTICE '❌ ID MISMATCH: Fixing...';
    DELETE FROM users WHERE email = super_admin_email;
    INSERT INTO users (id, email, role, gym_id)
    VALUES (auth_user_id, super_admin_email, 'OWNER'::user_role, NULL);
    RAISE NOTICE '✅ Fixed ID mismatch';
  ELSIF users_role != 'OWNER' THEN
    -- Role mismatch - fix it
    UPDATE users 
    SET role = 'OWNER'::user_role 
    WHERE email = super_admin_email;
    RAISE NOTICE '✅ Updated role to OWNER';
  ELSE
    RAISE NOTICE '✅ users table record is correct (ID matches, role is OWNER)';
  END IF;
END $$;

-- ============================================
-- PART 3: VERIFY RLS POLICIES
-- ============================================

DO $$
DECLARE
  policy_count INTEGER := 0;
BEGIN
  -- Check Super Admin policy for users table
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'users' 
  AND policyname LIKE '%Super Admin%';
  
  IF policy_count = 0 THEN
    RAISE NOTICE '⚠️ Super Admin RLS policy missing, creating...';
    
    CREATE POLICY IF NOT EXISTS "Super Admin can manage all users"
    ON users FOR ALL
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fitnesswithimran1@gmail.com')
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fitnesswithimran1@gmail.com')
    );
    
    RAISE NOTICE '✅ Created Super Admin RLS policy';
  ELSE
    RAISE NOTICE '✅ Super Admin RLS policy exists';
  END IF;
END $$;

-- ============================================
-- PART 4: FINAL VERIFICATION
-- ============================================

DO $$
DECLARE
  super_admin_email TEXT := 'fitnesswithimran1@gmail.com';
  auth_user_id UUID;
  auth_confirmed BOOLEAN := false;
  users_table_id UUID;
  users_role TEXT;
  all_checks_passed BOOLEAN := true;
BEGIN
  -- Check auth user
  SELECT 
    id,
    CASE WHEN confirmed_at IS NOT NULL THEN true ELSE false END
  INTO auth_user_id, auth_confirmed
  FROM auth.users 
  WHERE email = super_admin_email 
  LIMIT 1;
  
  IF auth_user_id IS NULL THEN
    RAISE NOTICE '❌ CHECK FAILED: Auth user not found';
    all_checks_passed := false;
  ELSIF NOT auth_confirmed THEN
    RAISE NOTICE '❌ CHECK FAILED: Auth user not confirmed';
    all_checks_passed := false;
  ELSE
    RAISE NOTICE '✅ Auth user: EXISTS and CONFIRMED';
  END IF;
  
  -- Check users table
  SELECT id, role::text INTO users_table_id, users_role
  FROM users 
  WHERE email = super_admin_email
  LIMIT 1;
  
  IF users_table_id IS NULL THEN
    RAISE NOTICE '❌ CHECK FAILED: users table record not found';
    all_checks_passed := false;
  ELSIF users_table_id != auth_user_id THEN
    RAISE NOTICE '❌ CHECK FAILED: ID mismatch';
    all_checks_passed := false;
  ELSIF users_role != 'OWNER' THEN
    RAISE NOTICE '❌ CHECK FAILED: Role is % (should be OWNER)', users_role;
    all_checks_passed := false;
  ELSE
    RAISE NOTICE '✅ users table: ID matches, role is OWNER';
  END IF;
  
  -- Final status
  RAISE NOTICE '';
  IF all_checks_passed THEN
    RAISE NOTICE '✅✅✅ ALL CHECKS PASSED ✅✅✅';
    RAISE NOTICE '   Login should work now!';
    RAISE NOTICE '   Email: %', super_admin_email;
    RAISE NOTICE '   Password: Aa543543@';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '❌❌❌ SOME CHECKS FAILED ❌❌❌';
    RAISE NOTICE '   Please fix the issues above and run script again.';
    RAISE NOTICE '';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check auth user status
SELECT 
  'Auth User Status' as check_type,
  id as auth_user_id,
  email,
  CASE 
    WHEN confirmed_at IS NOT NULL THEN '✅ CONFIRMED' 
    ELSE '❌ NOT CONFIRMED' 
  END as confirmation_status,
  confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'fitnesswithimran1@gmail.com';

-- Check users table record
SELECT 
  'Users Table Status' as check_type,
  id as users_table_id,
  email,
  role,
  gym_id,
  CASE 
    WHEN id = (SELECT id FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1)
    THEN '✅ MATCH' 
    ELSE '❌ MISMATCH' 
  END as id_match_status
FROM users 
WHERE email = 'fitnesswithimran1@gmail.com';

-- Check ID match
SELECT 
  'ID Match Verification' as check_type,
  (SELECT id FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1) as auth_users_id,
  (SELECT id FROM users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1) as users_table_id,
  CASE 
    WHEN (SELECT id FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1) = 
         (SELECT id FROM users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1)
    THEN '✅ MATCH' 
    ELSE '❌ MISMATCH' 
  END as match_status;

