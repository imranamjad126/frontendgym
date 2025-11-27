-- ============================================
-- VERIFY COMPLETE SETUP - Run This to Check
-- ============================================
-- Ye script sab kuch check karega aur bataega
-- kya kya missing hai
-- ============================================

-- ============================================
-- CHECK 1: Tables Exist?
-- ============================================
SELECT '📋 CHECK 1: Tables' as check_name;

SELECT 
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ All 5 tables exist'
    ELSE '❌ Missing tables! Expected 5, found ' || COUNT(*)::text
  END as status,
  string_agg(tablename, ', ' ORDER BY tablename) as tables_found
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('gyms', 'users', 'members', 'attendance', 'payments');

-- ============================================
-- CHECK 2: Auth User Exists?
-- ============================================
SELECT '📋 CHECK 2: Auth User' as check_name;

SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Auth user exists'
    ELSE '❌ Auth user NOT found! Create in Authentication → Users'
  END as status,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      'Email: ' || email || 
      CASE 
        WHEN email_confirmed_at IS NOT NULL THEN ' ✅ Confirmed'
        ELSE ' ❌ NOT Confirmed - Go to Auth → Users → Set Email Confirmed = TRUE'
      END
    ELSE 'No user found'
  END as details
FROM auth.users 
WHERE email = 'fitnesswithimran1@gmail.com';

-- ============================================
-- CHECK 3: Users Table Record Exists?
-- ============================================
SELECT '📋 CHECK 3: Users Table Record' as check_name;

SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Users table record exists'
    ELSE '❌ Users table record NOT found! Run STEP 2 SQL query'
  END as status,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      'Role: ' || role || 
      CASE 
        WHEN role = 'ADMIN' THEN ' ✅'
        ELSE ' ❌ Should be ADMIN'
      END ||
      ', Gym ID: ' || COALESCE(gym_id::text, 'NULL ✅')
    ELSE 'No record found'
  END as details
FROM users 
WHERE email = 'fitnesswithimran1@gmail.com';

-- ============================================
-- CHECK 4: Email Confirmed?
-- ============================================
SELECT '📋 CHECK 4: Email Confirmed' as check_name;

SELECT 
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email is confirmed'
    ELSE '❌ Email NOT confirmed! Go to Auth → Users → Set Email Confirmed = TRUE'
  END as status,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 
      'Confirmed at: ' || email_confirmed_at::text
    ELSE 'Not confirmed'
  END as details
FROM auth.users 
WHERE email = 'fitnesswithimran1@gmail.com';

-- ============================================
-- CHECK 5: RLS Policies Enabled?
-- ============================================
SELECT '📋 CHECK 5: RLS Policies' as check_name;

SELECT 
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ RLS enabled on all tables'
    ELSE '❌ RLS not enabled on all tables'
  END as status,
  string_agg(
    CASE WHEN rowsecurity THEN tablename || ' ✅' ELSE tablename || ' ❌' END, 
    ', '
  ) as tables_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('gyms', 'users', 'members', 'attendance', 'payments');

-- ============================================
-- FINAL SUMMARY
-- ============================================
SELECT '📊 FINAL SUMMARY' as summary;

SELECT 
  'Setup Status' as item,
  CASE 
    WHEN 
      (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('gyms', 'users', 'members', 'attendance', 'payments')) = 5
      AND (SELECT COUNT(*) FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com') > 0
      AND (SELECT email_confirmed_at FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com') IS NOT NULL
      AND (SELECT COUNT(*) FROM users WHERE email = 'fitnesswithimran1@gmail.com') > 0
      AND (SELECT role FROM users WHERE email = 'fitnesswithimran1@gmail.com') = 'ADMIN'
    THEN '✅ COMPLETE - Ready to login!'
    ELSE '❌ INCOMPLETE - Check errors above'
  END as status;

-- ============================================
-- QUICK FIX COMMANDS (If Something Missing)
-- ============================================
SELECT '🔧 QUICK FIXES' as fixes;

-- If users table record missing, run this:
SELECT 
  'If users table record missing, run:' as fix_type,
  'INSERT INTO users (id, email, role, gym_id) VALUES ((SELECT id FROM auth.users WHERE email = ''fitnesswithimran1@gmail.com''), ''fitnesswithimran1@gmail.com'', ''ADMIN'', NULL) ON CONFLICT (id) DO UPDATE SET role = ''ADMIN'', gym_id = NULL;' as sql_command;


