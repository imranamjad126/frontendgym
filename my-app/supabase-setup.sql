-- ============================================
-- Supabase Database Setup Script
-- ============================================
-- Run this script in your Supabase SQL Editor
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste this → Run

-- Step 1: Create the members table
CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  plan TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL,
  gender TEXT,
  fee_amount NUMERIC,
  fee_paid BOOLEAN DEFAULT false,
  fee_paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at DATE,
  frozen_date DATE
);

-- Step 2: Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policy for public access (for development)
-- WARNING: This allows anyone to read/write. For production, create more restrictive policies.

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations for anon users" ON members;

-- Create new policy
CREATE POLICY "Allow all operations for anon users"
ON members
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Step 4: Create policy for authenticated users (optional, for future use)
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON members;

CREATE POLICY "Allow all operations for authenticated users"
ON members
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_deleted_at ON members(deleted_at);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);

-- Step 6: Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verification Queries (Optional - run to verify)
-- ============================================

-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'members';

-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'members';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'members';



