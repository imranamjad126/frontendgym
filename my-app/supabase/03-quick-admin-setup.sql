-- ============================================
-- QUICK ADMIN SETUP - RUN THIS AFTER CREATING AUTH USER
-- ============================================
-- 
-- PREREQUISITE: 
-- 1. Create user in Supabase Dashboard → Authentication → Users
--    Email: fitnesswithimran1@gmail.com
--    Password: Aa543543@
--    Auto Confirm: YES
--
-- 2. Then run this script
-- ============================================

-- Check if auth user exists
DO $$
DECLARE
  auth_user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Get auth user ID
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'fitnesswithimran1@gmail.com';
  
  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION '❌ Auth user not found! 
    
    Please create user first:
    1. Go to Supabase Dashboard → Authentication → Users
    2. Click "Add User" → "Create new user"
    3. Email: fitnesswithimran1@gmail.com
    4. Password: Aa543543@
    5. Auto Confirm User: YES
    6. Then run this script again.';
  END IF;
  
  -- Check if user already exists in users table
  SELECT EXISTS(SELECT 1 FROM users WHERE id = auth_user_id) INTO user_exists;
  
  IF user_exists THEN
    -- Update existing user
    UPDATE users 
    SET role = 'ADMIN', gym_id = NULL, email = 'fitnesswithimran1@gmail.com'
    WHERE id = auth_user_id;
    
    RAISE NOTICE '✅ Admin user updated successfully!';
  ELSE
    -- Insert new user
    INSERT INTO users (id, email, role, gym_id)
    VALUES (auth_user_id, 'fitnesswithimran1@gmail.com', 'ADMIN', NULL);
    
    RAISE NOTICE '✅ Admin user created successfully!';
  END IF;
  
  RAISE NOTICE '📧 Email: fitnesswithimran1@gmail.com';
  RAISE NOTICE '🔑 Password: Aa543543@';
  RAISE NOTICE '👤 Role: ADMIN';
  RAISE NOTICE '';
  RAISE NOTICE '✅ You can now login at: http://localhost:3000/login';
  
END $$;

-- Verify the setup
SELECT 
  '✅ Verification' as status,
  u.id,
  u.email,
  u.role,
  u.gym_id,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ NOT Confirmed - Go to Auth → Users → Set Email Confirmed = TRUE'
  END as email_status
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'fitnesswithimran1@gmail.com';



