-- ============================================
-- FIX CONSTRAINT AND SUPER ADMIN LOGIN
-- ============================================
-- This script fixes the staff_must_have_gym constraint
-- to allow OWNER with gym_id = NULL (Super Admin)
-- ============================================

-- ============================================
-- PART 1: TEMPORARILY RELAX CONSTRAINT
-- ============================================

DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'staff_must_have_gym' 
    AND table_name = 'users'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT staff_must_have_gym;
    RAISE NOTICE '✅ Dropped existing staff_must_have_gym constraint';
  ELSE
    RAISE NOTICE 'ℹ️ staff_must_have_gym constraint does not exist';
  END IF;
END $$;

-- ============================================
-- PART 2: INSERT/UPDATE SUPER ADMIN SAFELY
-- ============================================

DO $$
DECLARE
  super_admin_email TEXT := 'fitnesswithimran1@gmail.com';
  auth_user_id UUID;
  users_table_id UUID;
BEGIN
  -- Get auth user ID
  SELECT id INTO auth_user_id
  FROM auth.users 
  WHERE email = super_admin_email 
  LIMIT 1;
  
  IF auth_user_id IS NULL THEN
    RAISE NOTICE '❌ Auth user not found: %', super_admin_email;
    RAISE NOTICE '⚠️ Please create auth user first in Supabase Dashboard';
    RAISE NOTICE '   Authentication → Users → Add User';
    RAISE NOTICE '   Email: %, Password: Aa543543@, Auto Confirm: YES', super_admin_email;
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Auth user found: % (ID: %)', super_admin_email, auth_user_id;
  
  -- Check if users table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    RAISE NOTICE '⚠️ users table does not exist';
    RETURN;
  END IF;
  
  -- Check if record exists
  SELECT id INTO users_table_id
  FROM users 
  WHERE email = super_admin_email
  LIMIT 1;
  
  IF users_table_id IS NULL THEN
    -- Insert new record
    INSERT INTO users (id, email, role, gym_id)
    VALUES (auth_user_id, super_admin_email, 'OWNER'::user_role, NULL)
    ON CONFLICT (id) DO UPDATE 
    SET email = super_admin_email, role = 'OWNER'::user_role, gym_id = NULL;
    
    RAISE NOTICE '✅ Created Super Admin record with gym_id = NULL';
  ELSIF users_table_id != auth_user_id THEN
    -- ID mismatch - fix it
    RAISE NOTICE '❌ ID MISMATCH: Fixing...';
    DELETE FROM users WHERE email = super_admin_email;
    INSERT INTO users (id, email, role, gym_id)
    VALUES (auth_user_id, super_admin_email, 'OWNER'::user_role, NULL);
    RAISE NOTICE '✅ Fixed ID mismatch and set gym_id = NULL';
  ELSE
    -- Update existing record
    UPDATE users 
    SET email = super_admin_email, 
        role = 'OWNER'::user_role, 
        gym_id = NULL
    WHERE id = auth_user_id;
    
    RAISE NOTICE '✅ Updated Super Admin record (role = OWNER, gym_id = NULL)';
  END IF;
END $$;

-- ============================================
-- PART 3: RECREATE CONSTRAINT (ALLOW OWNER NULL)
-- ============================================

DO $$
BEGIN
  -- Recreate constraint: STAFF must have gym_id, OWNER can have NULL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'staff_must_have_gym' 
    AND table_name = 'users'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT staff_must_have_gym 
    CHECK (
      (role = 'STAFF' AND gym_id IS NOT NULL) OR
      (role = 'OWNER')
    );
    
    RAISE NOTICE '✅ Created staff_must_have_gym constraint';
    RAISE NOTICE '   - STAFF must have gym_id (NOT NULL)';
    RAISE NOTICE '   - OWNER can have gym_id = NULL (Super Admin)';
  ELSE
    RAISE NOTICE 'ℹ️ staff_must_have_gym constraint already exists';
  END IF;
END $$;

-- ============================================
-- PART 4: VERIFY SUPER ADMIN RECORD
-- ============================================

DO $$
DECLARE
  super_admin_email TEXT := 'fitnesswithimran1@gmail.com';
  auth_user_id UUID;
  users_table_id UUID;
  users_role TEXT;
  users_gym_id UUID;
  id_match BOOLEAN := false;
  role_correct BOOLEAN := false;
  gym_id_correct BOOLEAN := false;
BEGIN
  -- Get auth user ID
  SELECT id INTO auth_user_id
  FROM auth.users 
  WHERE email = super_admin_email 
  LIMIT 1;
  
  -- Get users table record
  SELECT id, role::text, gym_id INTO users_table_id, users_role, users_gym_id
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
  
  -- Check gym_id (should be NULL for Super Admin)
  IF users_gym_id IS NULL THEN
    gym_id_correct := true;
    RAISE NOTICE '✅ gym_id Correct: NULL (Super Admin)';
  ELSE
    RAISE NOTICE '⚠️ gym_id is not NULL: % (should be NULL for Super Admin)', users_gym_id;
  END IF;
  
  -- Final status
  IF id_match AND role_correct AND gym_id_correct THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅✅✅ VERIFICATION PASSED ✅✅✅';
    RAISE NOTICE '   Auth user: EXISTS';
    RAISE NOTICE '   users.id matches auth.users.id: YES';
    RAISE NOTICE '   Role: OWNER';
    RAISE NOTICE '   gym_id: NULL (Super Admin)';
    RAISE NOTICE '   Constraint: Fixed (OWNER can have NULL)';
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
-- VERIFICATION QUERIES
-- ============================================

-- Check constraint definition
SELECT 
  'Constraint Check' as check_type,
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'staff_must_have_gym';

-- Check Super Admin record
SELECT 
  'Super Admin Record' as check_type,
  id,
  email,
  role,
  gym_id,
  CASE 
    WHEN id = (SELECT id FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com' LIMIT 1)
    THEN '✅ ID MATCH' 
    ELSE '❌ ID MISMATCH' 
  END as id_match,
  CASE 
    WHEN role = 'OWNER' THEN '✅ ROLE CORRECT'
    ELSE '❌ ROLE INCORRECT'
  END as role_check,
  CASE 
    WHEN gym_id IS NULL THEN '✅ GYM_ID CORRECT (NULL)'
    ELSE '⚠️ GYM_ID NOT NULL'
  END as gym_id_check
FROM users 
WHERE email = 'fitnesswithimran1@gmail.com';

