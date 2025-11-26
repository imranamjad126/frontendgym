-- ============================================
-- COMPLETE AUTO-SETUP FOR ADMIN USER
-- ============================================
-- Ye script automatically admin user setup karega
-- Agar user nahi hai to error dega (pehle Dashboard se create karein)
-- ============================================

DO $$
DECLARE
  auth_user_id UUID;
  user_exists_in_auth BOOLEAN;
  user_exists_in_users BOOLEAN;
  email_confirmed BOOLEAN;
BEGIN
  -- Step 1: Check if auth user exists
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'fitnesswithimran1@gmail.com';
  
  SELECT (auth_user_id IS NOT NULL) INTO user_exists_in_auth;
  
  IF NOT user_exists_in_auth THEN
    RAISE EXCEPTION '❌ Auth user not found!

    Please create user first in Supabase Dashboard:
    1. Go to: Authentication → Users
    2. Click: "Add User" → "Create new user"
    3. Email: fitnesswithimran1@gmail.com
    4. Password: Aa543543@
    5. Auto Confirm User: YES
    6. Then run this script again.';
  END IF;
  
  -- Step 2: Check email confirmation
  SELECT (email_confirmed_at IS NOT NULL) INTO email_confirmed
  FROM auth.users 
  WHERE id = auth_user_id;
  
  IF NOT email_confirmed THEN
    RAISE WARNING '⚠️ Email not confirmed! Go to Auth → Users → Set Email Confirmed = TRUE';
    
    -- Try to update (requires service role)
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE id = auth_user_id;
    
    IF FOUND THEN
      RAISE NOTICE '✅ Email confirmed via SQL';
    END IF;
  ELSE
    RAISE NOTICE '✅ Email is confirmed';
  END IF;
  
  -- Step 3: Check users table record
  SELECT EXISTS(
    SELECT 1 FROM users WHERE id = auth_user_id
  ) INTO user_exists_in_users;
  
  IF user_exists_in_users THEN
    -- Update existing user
    UPDATE users 
    SET 
      email = 'fitnesswithimran1@gmail.com',
      role = 'ADMIN',
      gym_id = NULL,
      updated_at = NOW()
    WHERE id = auth_user_id;
    
    RAISE NOTICE '✅ Admin user updated in users table!';
  ELSE
    -- Insert new user
    INSERT INTO users (id, email, role, gym_id, created_at, updated_at)
    VALUES (
      auth_user_id,
      'fitnesswithimran1@gmail.com',
      'ADMIN',
      NULL,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✅ Admin user created in users table!';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email: fitnesswithimran1@gmail.com';
  RAISE NOTICE '🔑 Password: Aa543543@';
  RAISE NOTICE '👤 Role: ADMIN';
  RAISE NOTICE '🏢 Gym ID: NULL (Admin has access to all gyms)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Setup complete! You can now login.';
  
END $$;

-- Verify the setup
SELECT 
  '✅ Verification' as status,
  u.id,
  u.email,
  u.role,
  u.gym_id,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email Confirmed'
    ELSE '❌ Email NOT Confirmed - Go to Auth → Users → Set Email Confirmed = TRUE'
  END as email_status
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'fitnesswithimran1@gmail.com';

-- Check schema
SELECT 
  '📋 Schema Check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gyms') THEN '✅ gyms table'
    ELSE '❌ gyms table missing'
  END as gyms_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN '✅ users table'
    ELSE '❌ users table missing'
  END as users_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'members') THEN '✅ members table'
    ELSE '❌ members table missing'
  END as members_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'gym_id') THEN '✅ members.gym_id column'
    ELSE '❌ members.gym_id column missing'
  END as gym_id_column;

