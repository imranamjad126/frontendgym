-- ============================================
-- COMPLETE OWNER/STAFF SYSTEM SETUP
-- ============================================
-- This script creates the complete multi-gym SaaS system
-- with Super Admin, Owner, and optional Staff roles
-- Works for both fresh install and upgrade scenarios
-- ============================================

-- ============================================
-- PART 1: CLEANUP (Optional - only if upgrading)
-- ============================================

-- Drop old policies first (if they exist)
DROP POLICY IF EXISTS "Admins can manage all gyms" ON gyms;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Admins can view all members" ON members;
DROP POLICY IF EXISTS "Admins can manage all members" ON members;
DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can manage all attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;

-- Drop old tables (if upgrading from old schema)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS gyms CASCADE;

-- Drop old enum
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================
-- PART 2: CREATE TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('OWNER', 'STAFF');

-- ============================================
-- PART 3: CREATE TABLES
-- ============================================

-- TABLE: gyms
CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'STAFF',
  gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT staff_must_have_gym CHECK (
    (role = 'STAFF' AND gym_id IS NOT NULL) OR 
    (role = 'OWNER' AND gym_id IS NOT NULL)
  )
);

-- TABLE: members (with gym_id)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  gender TEXT,
  fee_type TEXT NOT NULL,
  fee_amount INTEGER NOT NULL,
  fee_paid BOOLEAN DEFAULT false,
  fee_status TEXT NOT NULL,
  status TEXT,
  fee_paid_date DATE,
  expiry_date DATE NOT NULL,
  frozen_date DATE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: attendance (with gym_id)
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, date)
);

-- TABLE: payments (with gym_id)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 4: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_gym_id ON users(gym_id);
CREATE INDEX IF NOT EXISTS idx_gyms_name ON gyms(name);
CREATE INDEX IF NOT EXISTS idx_members_gym_id ON members(gym_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_expiry_date ON members(expiry_date);
CREATE INDEX IF NOT EXISTS idx_attendance_gym_id ON attendance(gym_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_payments_gym_id ON payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);

-- ============================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 6: CREATE RLS POLICIES
-- ============================================

-- ============================================
-- GYMS POLICIES
-- ============================================

-- Super Admin (fitnesswithimran1@gmail.com) can manage all gyms
CREATE POLICY "Super Admin can manage all gyms"
ON gyms FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fitnesswithimran1@gmail.com')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fitnesswithimran1@gmail.com')
);

-- Owners can view and manage their own gym
CREATE POLICY "Owners can manage their gym"
ON gyms FOR ALL
TO authenticated
USING (
  id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
)
WITH CHECK (
  id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
);

-- Staff can view their gym (read-only)
CREATE POLICY "Staff can view their gym"
ON gyms FOR SELECT
TO authenticated
USING (
  id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- ============================================
-- USERS POLICIES
-- ============================================

-- Super Admin can view and manage all users
CREATE POLICY "Super Admin can manage all users"
ON users FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fitnesswithimran1@gmail.com')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fitnesswithimran1@gmail.com')
);

-- Owners can view users from their gym
CREATE POLICY "Owners can view their gym users"
ON users FOR SELECT
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
  OR id = auth.uid()
);

-- Owners can manage users from their gym (create staff)
CREATE POLICY "Owners can manage their gym users"
ON users FOR ALL
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
)
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
  AND role = 'STAFF'  -- Owners can only create STAFF, not other OWNERS
);

-- Users can view their own record
CREATE POLICY "Users can view own record"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());

-- ============================================
-- MEMBERS POLICIES
-- ============================================

-- Owners can view and manage all members from their gym
CREATE POLICY "Owners can manage their gym members"
ON members FOR ALL
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
)
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
);

-- Staff can view and add members from their gym
CREATE POLICY "Staff can view their gym members"
ON members FOR SELECT
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- Staff can insert members (add new members)
CREATE POLICY "Staff can add members"
ON members FOR INSERT
TO authenticated
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- Staff can update members (but not delete - that's owner only)
CREATE POLICY "Staff can update members"
ON members FOR UPDATE
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
)
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- Staff CANNOT delete members (no DELETE policy for staff)

-- ============================================
-- ATTENDANCE POLICIES
-- ============================================

-- Owners can manage all attendance from their gym
CREATE POLICY "Owners can manage their gym attendance"
ON attendance FOR ALL
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
)
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
);

-- Staff can view and add attendance
CREATE POLICY "Staff can view their gym attendance"
ON attendance FOR SELECT
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- Staff can add attendance (mark attendance)
CREATE POLICY "Staff can add attendance"
ON attendance FOR INSERT
TO authenticated
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- Staff can update attendance
CREATE POLICY "Staff can update attendance"
ON attendance FOR UPDATE
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
)
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- Staff CANNOT delete attendance (no DELETE policy for staff)

-- ============================================
-- PAYMENTS POLICIES
-- ============================================

-- Owners can manage all payments from their gym
CREATE POLICY "Owners can manage their gym payments"
ON payments FOR ALL
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
)
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
);

-- Staff can view and add payments
CREATE POLICY "Staff can view their gym payments"
ON payments FOR SELECT
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- Staff can add payments
CREATE POLICY "Staff can add payments"
ON payments FOR INSERT
TO authenticated
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- Staff can update payments
CREATE POLICY "Staff can update payments"
ON payments FOR UPDATE
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
)
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- Staff CANNOT delete payments (no DELETE policy for staff)

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '✅ Complete Setup Successful!' as status;
SELECT 'Tables created: gyms, users, members, attendance, payments' as tables;
SELECT 'Role enum: OWNER | STAFF' as roles;
SELECT 'RLS policies: Super Admin, Owner, Staff' as policies;
SELECT 'Super Admin email: fitnesswithimran1@gmail.com' as super_admin;

