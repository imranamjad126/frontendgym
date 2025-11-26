-- ============================================
-- MULTI-USER GYM MANAGEMENT SYSTEM SETUP
-- ============================================
-- This script sets up:
-- 1. Users table with roles (ADMIN | STAFF)
-- 2. Gyms table
-- 3. Updates members/attendance/payments with gym_id
-- 4. Creates admin user
-- 5. Sets up RLS policies

-- ============================================
-- PART 1: CLEANUP (if needed)
-- ============================================

DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS gyms CASCADE;

-- Drop types
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================
-- PART 2: CREATE TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF');

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
    (role = 'ADMIN' AND gym_id IS NULL)
  )
);

-- TABLE: members (updated with gym_id)
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

-- TABLE: attendance (updated with gym_id)
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, date)
);

-- TABLE: payments (updated with gym_id)
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_gym_id ON users(gym_id);
CREATE INDEX idx_gyms_name ON gyms(name);
CREATE INDEX idx_members_gym_id ON members(gym_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_expiry_date ON members(expiry_date);
CREATE INDEX idx_attendance_gym_id ON attendance(gym_id);
CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_payments_gym_id ON payments(gym_id);
CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_date ON payments(date);

-- ============================================
-- PART 5: CREATE FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_gyms_updated_at
  BEFORE UPDATE ON gyms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get user's gym_id
CREATE OR REPLACE FUNCTION get_user_gym_id(user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT gym_id FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'ADMIN' FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 6: ENABLE RLS
-- ============================================

ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 7: CREATE RLS POLICIES
-- ============================================

-- GYMS POLICIES
-- Admins can do everything
CREATE POLICY "Admins can manage all gyms"
ON gyms FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Staff can view their own gym
CREATE POLICY "Staff can view their gym"
ON gyms FOR SELECT
TO authenticated
USING (
  id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- USERS POLICIES
-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Users can view their own record
CREATE POLICY "Users can view own record"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admins can insert/update users
CREATE POLICY "Admins can manage users"
ON users FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- MEMBERS POLICIES
-- Admins can view all members
CREATE POLICY "Admins can view all members"
ON members FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Staff can only view members from their gym
CREATE POLICY "Staff can view their gym members"
ON members FOR SELECT
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- Admins can manage all members
CREATE POLICY "Admins can manage all members"
ON members FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Staff can manage members from their gym
CREATE POLICY "Staff can manage their gym members"
ON members FOR ALL
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
)
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- ATTENDANCE POLICIES
-- Admins can view all attendance
CREATE POLICY "Admins can view all attendance"
ON attendance FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Staff can view attendance from their gym
CREATE POLICY "Staff can view their gym attendance"
ON attendance FOR SELECT
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- Admins can manage all attendance
CREATE POLICY "Admins can manage all attendance"
ON attendance FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Staff can manage attendance from their gym
CREATE POLICY "Staff can manage their gym attendance"
ON attendance FOR ALL
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
)
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- PAYMENTS POLICIES
-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON payments FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Staff can view payments from their gym
CREATE POLICY "Staff can view their gym payments"
ON payments FOR SELECT
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- Admins can manage all payments
CREATE POLICY "Admins can manage all payments"
ON payments FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Staff can manage payments from their gym
CREATE POLICY "Staff can manage their gym payments"
ON payments FOR ALL
TO authenticated
USING (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
)
WITH CHECK (
  gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);

-- ============================================
-- PART 8: CREATE ADMIN USER
-- ============================================
-- Note: Admin user must be created via Supabase Auth first
-- Then run this to create the user record:
-- 
-- INSERT INTO users (id, email, role)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com'),
--   'fitnesswithimran1@gmail.com',
--   'ADMIN'
-- );

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '✅ Multi-user setup complete!' as status;
SELECT 'Tables created:' as info, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT 'RLS enabled:' as info, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

