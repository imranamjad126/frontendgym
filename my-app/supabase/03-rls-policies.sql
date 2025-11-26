-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================
-- Run this AFTER creating tables
-- Enables RLS and creates policies for public access

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all operations for anon users" ON members;
DROP POLICY IF EXISTS "Allow all operations for anon users" ON attendance;
DROP POLICY IF EXISTS "Allow all operations for anon users" ON payments;

-- Create policies for members table
CREATE POLICY "Allow all operations for anon users"
ON members
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Create policies for attendance table
CREATE POLICY "Allow all operations for anon users"
ON attendance
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Create policies for payments table
CREATE POLICY "Allow all operations for anon users"
ON payments
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Verification
SELECT 'RLS Policies created successfully' as status;
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;



