-- ============================================
-- AUTO-CREATE ADMIN USER
-- ============================================
-- Ye script automatically admin user create/update karega
-- Agar user nahi hai to error dega (pehle Dashboard se create karein)
-- ============================================

DO $$
DECLARE
  auth_user_id UUID;
  user_exists_in_auth BOOLEAN;
  user_exists_in_users BOOLEAN;
BEGIN
  -- Check if auth user exists
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
  
  -- Check if email is confirmed
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'fitnesswithimran1@gmail.com' 
    AND email_confirmed_at IS NOT NULL
  ) THEN
    RAISE WARNING '⚠️ Email not confirmed! Go to Auth → Users → Set Email Confirmed = TRUE';
  END IF;
  
  -- Check if user exists in users table
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

