-- ============================================
-- CREATE ADMIN USER
-- ============================================
-- Run this AFTER creating the admin user in Supabase Auth
-- 
-- Steps:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create new user"
-- 3. Email: fitnesswithimran1@gmail.com
-- 4. Password: Aa543543@
-- 5. Auto Confirm User: Yes
-- 6. Click "Create user"
-- 7. Copy the user ID from the users table
-- 8. Run this SQL script with the user ID

-- Replace 'USER_ID_FROM_AUTH' with the actual user ID from auth.users
-- You can find it by running:
-- SELECT id, email FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com';

INSERT INTO users (id, email, role, gym_id)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com'),
  'fitnesswithimran1@gmail.com',
  'ADMIN',
  NULL
)
ON CONFLICT (id) DO UPDATE
SET role = 'ADMIN', gym_id = NULL;

SELECT '✅ Admin user created!' as status;



