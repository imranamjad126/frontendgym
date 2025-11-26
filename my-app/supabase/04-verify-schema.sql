-- ============================================
-- VERIFY SCHEMA
-- ============================================
-- Run this to verify tables are created correctly

-- Check tables exist
SELECT 'Tables:' as check_type, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check members table structure
SELECT 'Members columns:' as check_type, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'members'
ORDER BY ordinal_position;

-- Check attendance table structure
SELECT 'Attendance columns:' as check_type, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'attendance'
ORDER BY ordinal_position;

-- Check payments table structure
SELECT 'Payments columns:' as check_type, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payments'
ORDER BY ordinal_position;

-- Check RLS status
SELECT 'RLS Status:' as check_type, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check policies
SELECT 'Policies:' as check_type, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;



