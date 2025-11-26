-- ============================================
-- COMPLETE SUPABASE SETUP - RUN THIS FIRST
-- ============================================
-- This script does everything in one go:
-- 1. Cleans all existing objects
-- 2. Creates fresh schema
-- 3. Sets up RLS policies
-- 
-- Go to: Supabase Dashboard → SQL Editor → New Query
-- Copy this ENTIRE file → Paste → Run

-- ============================================
-- PART 1: CLEANUP
-- ============================================

-- Drop all existing tables (CASCADE removes dependencies)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- Drop all existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_members_updated_at() CASCADE;

-- Drop all existing triggers
DROP TRIGGER IF EXISTS update_members_updated_at ON members CASCADE;
DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance CASCADE;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments CASCADE;

-- Drop all existing views
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Drop all custom types
DROP TYPE IF EXISTS membership_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS ac_type CASCADE;

-- ============================================
-- PART 2: CREATE SCHEMA
-- ============================================

-- TABLE: members
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT,
  cnic TEXT,
  membership_type TEXT NOT NULL,
  ac_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  UNIQUE(member_id, date)
);

-- TABLE: payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL,
  date DATE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_date ON payments(date);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_expiry_date ON members(expiry_date);

-- ============================================
-- PART 3: RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '✅ Setup Complete!' as status;
SELECT 'Tables created:' as info, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT 'RLS enabled:' as info, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT 'Policies created:' as info, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;

