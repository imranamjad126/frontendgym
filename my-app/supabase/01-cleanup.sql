-- ============================================
-- COMPLETE SUPABASE CLEANUP SCRIPT
-- ============================================
-- This script removes ALL existing database objects
-- Run this FIRST to clean your Supabase project
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste → Run

-- Step 1: Drop all existing tables (CASCADE removes dependencies)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- Step 2: Drop all existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_members_updated_at() CASCADE;

-- Step 3: Drop all existing triggers
DROP TRIGGER IF EXISTS update_members_updated_at ON members CASCADE;
DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance CASCADE;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments CASCADE;

-- Step 4: Drop all existing views
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP;
END $$;

-- Step 5: Drop all existing policies (if any remain)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Step 6: Drop all custom types (if any)
DROP TYPE IF EXISTS membership_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS ac_type CASCADE;

-- Verification: Check what remains
SELECT 'Cleanup complete. Remaining tables:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;



