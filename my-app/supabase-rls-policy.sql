-- ============================================
-- Supabase RLS (Row Level Security) Policy Setup
-- ============================================
-- This ensures the public anon key can read/write to the members table
-- Run this in Supabase SQL Editor if you get permission errors

-- Step 1: Enable RLS on members table (if not already enabled)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations for anon users" ON members;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON members;

-- Step 3: Create policy for anonymous users (public anon key)
-- This allows read and write operations for the anon role
CREATE POLICY "Allow all operations for anon users"
ON members
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Step 4: Create policy for authenticated users (optional, for future use)
CREATE POLICY "Allow all operations for authenticated users"
ON members
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- Verification Queries
-- ============================================

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'members';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'members';

-- Test query (should work after running this script)
-- SELECT * FROM members LIMIT 1;



