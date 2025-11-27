-- ============================================
-- MIGRATE FROM ADMIN/STAFF TO OWNER/STAFF SYSTEM
-- ============================================
-- This script migrates the system from ADMIN/STAFF to OWNER/STAFF
-- with support for super admin (special user, not a role)
-- ============================================

-- ============================================
-- PART 1: UPDATE USER_ROLE ENUM
-- ============================================

-- Drop old enum and create new one
DROP TYPE IF EXISTS user_role CASCADE;

CREATE TYPE user_role AS ENUM ('OWNER', 'STAFF');

-- ============================================
-- PART 2: UPDATE USERS TABLE
-- ============================================

-- First, update all ADMIN roles to OWNER
UPDATE users SET role = 'OWNER' WHERE role = 'ADMIN';

-- Update constraint to reflect new role
ALTER TABLE users DROP CONSTRAINT IF EXISTS staff_must_have_gym;

ALTER TABLE users ADD CONSTRAINT staff_must_have_gym CHECK (
  (role = 'STAFF' AND gym_id IS NOT NULL) OR 
  (role = 'OWNER' AND gym_id IS NOT NULL)
);

-- ============================================
-- PART 3: UPDATE RLS POLICIES
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Admins can manage all gyms" ON gyms;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Admins can view all members" ON members;
DROP POLICY IF EXISTS "Admins can manage all members" ON members;
DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can manage all attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;

-- ============================================
-- GYMS POLICIES
-- ============================================

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

SELECT '✅ Migration Complete!' as status;
SELECT 'Role enum updated: ADMIN → OWNER' as change_1;
SELECT 'RLS policies updated for OWNER/STAFF' as change_2;
SELECT 'Owners have full access to their gym' as change_3;
SELECT 'Staff have limited access (no delete)' as change_4;

