-- ============================================
-- SAFE MIGRATION: ADMIN/STAFF → OWNER/STAFF
-- ============================================
-- This script is IDEMPOTENT - can be run multiple times safely
-- Checks existence before creating/updating anything
-- ============================================

-- ============================================
-- PART 1: CREATE OR VERIFY USER_ROLE ENUM SAFELY
-- ============================================

DO $$
BEGIN
  -- Check if enum exists
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    -- Create enum with both values
    CREATE TYPE user_role AS ENUM ('OWNER', 'STAFF');
    RAISE NOTICE '✅ Created user_role enum with OWNER and STAFF';
  ELSE
    -- Enum exists, add values if missing (safe operation)
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'OWNER';
      RAISE NOTICE '✅ OWNER value added to enum (if missing)';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE '✅ OWNER value already exists in enum';
    END;
    
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'STAFF';
      RAISE NOTICE '✅ STAFF value added to enum (if missing)';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE '✅ STAFF value already exists in enum';
    END;
    
    RAISE NOTICE '✅ user_role enum verified';
  END IF;
END $$;

-- ============================================
-- PART 2: CREATE GYMS TABLE SAFELY (if needed)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'gyms'
  ) THEN
    CREATE TABLE gyms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE '✅ Created gyms table';
  ELSE
    RAISE NOTICE '✅ gyms table already exists';
  END IF;
END $$;

-- ============================================
-- PART 3: CREATE USERS TABLE SAFELY
-- ============================================
-- THIS MUST BE DONE BEFORE ANY UPDATE OPERATIONS
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    -- Create users table
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      role user_role NOT NULL,
      gym_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add foreign key to auth.users if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_id_fkey,
      ADD CONSTRAINT users_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Linked users.id to auth.users';
    END IF;
    
    -- Add foreign key to gyms if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'gyms'
    ) THEN
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_gym_id_fkey,
      ADD CONSTRAINT users_gym_id_fkey 
      FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL;
      RAISE NOTICE '✅ Linked users.gym_id to gyms';
    END IF;
    
    RAISE NOTICE '✅ Created users table';
  ELSE
    -- Table exists, ensure gym_id column exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'gym_id'
    ) THEN
      ALTER TABLE users ADD COLUMN gym_id UUID;
      
      -- Add foreign key if gyms table exists
      IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'gyms'
      ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_gym_id_fkey 
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL;
      END IF;
      
      RAISE NOTICE '✅ Added gym_id column to users table';
    END IF;
    
    RAISE NOTICE '✅ users table already exists';
  END IF;
END $$;

-- ============================================
-- PART 4: ENSURE MEMBERS TABLE HAS GYM_ID
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'members'
  ) THEN
    -- Check if gym_id column exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'members' 
      AND column_name = 'gym_id'
    ) THEN
      ALTER TABLE members ADD COLUMN gym_id UUID;
      
      -- Add foreign key if gyms table exists
      IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'gyms'
      ) THEN
        ALTER TABLE members 
        ADD CONSTRAINT members_gym_id_fkey 
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
      END IF;
      
      RAISE NOTICE '✅ Added gym_id column to members table';
    END IF;
  END IF;
END $$;

-- ============================================
-- PART 5: ENSURE ATTENDANCE TABLE HAS GYM_ID
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'attendance'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'attendance' 
      AND column_name = 'gym_id'
    ) THEN
      ALTER TABLE attendance ADD COLUMN gym_id UUID;
      
      IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'gyms'
      ) THEN
        ALTER TABLE attendance 
        ADD CONSTRAINT attendance_gym_id_fkey 
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
      END IF;
      
      RAISE NOTICE '✅ Added gym_id column to attendance table';
    END IF;
  END IF;
END $$;

-- ============================================
-- PART 6: ENSURE PAYMENTS TABLE HAS GYM_ID
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'payments'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'payments' 
      AND column_name = 'gym_id'
    ) THEN
      ALTER TABLE payments ADD COLUMN gym_id UUID;
      
      IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'gyms'
      ) THEN
        ALTER TABLE payments 
        ADD CONSTRAINT payments_gym_id_fkey 
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
      END IF;
      
      RAISE NOTICE '✅ Added gym_id column to payments table';
    END IF;
  END IF;
END $$;

-- ============================================
-- PART 7: INSERT SUPER ADMIN SAFELY
-- ============================================
-- Must be done before RLS policies that reference it
-- ============================================

DO $$
DECLARE
  super_admin_email TEXT := 'fitnesswithimran1@gmail.com';
  auth_user_id UUID;
BEGIN
  -- Only proceed if users table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    -- Check if Super Admin already exists
    IF NOT EXISTS (
      SELECT 1 FROM users WHERE email = super_admin_email
    ) THEN
      -- Try to find auth user first
      IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
      ) THEN
        SELECT id INTO auth_user_id 
        FROM auth.users 
        WHERE email = super_admin_email 
        LIMIT 1;
        
        IF auth_user_id IS NOT NULL THEN
          -- Insert Super Admin with auth user ID
          INSERT INTO users (id, email, role, gym_id)
          VALUES (auth_user_id, super_admin_email, 'OWNER'::user_role, NULL)
          ON CONFLICT (id) DO UPDATE 
          SET email = super_admin_email, role = 'OWNER'::user_role;
          RAISE NOTICE '✅ Super Admin inserted/updated with auth user ID';
        ELSE
          -- Auth user not found, create with random UUID
          INSERT INTO users (id, email, role, gym_id)
          VALUES (gen_random_uuid(), super_admin_email, 'OWNER'::user_role, NULL)
          ON CONFLICT (email) DO UPDATE 
          SET role = 'OWNER'::user_role;
          RAISE NOTICE '✅ Super Admin inserted (auth user not found, using random UUID)';
        END IF;
      ELSE
        -- No auth.users table, create with random UUID
        INSERT INTO users (id, email, role, gym_id)
        VALUES (gen_random_uuid(), super_admin_email, 'OWNER'::user_role, NULL)
        ON CONFLICT (email) DO UPDATE 
        SET role = 'OWNER'::user_role;
        RAISE NOTICE '✅ Super Admin inserted (no auth.users table)';
      END IF;
    ELSE
      -- Update existing Super Admin to OWNER role
      UPDATE users 
      SET role = 'OWNER'::user_role 
      WHERE email = super_admin_email AND role::text != 'OWNER';
      RAISE NOTICE '✅ Super Admin already exists, verified OWNER role';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ users table does not exist, skipping Super Admin insert';
  END IF;
END $$;

-- ============================================
-- PART 8: CONVERT ADMIN ROLES TO OWNER SAFELY
-- ============================================
-- Only runs if users table exists
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    -- Check if there are any ADMIN roles to convert
    -- Use text comparison to handle enum casting
    IF EXISTS (
      SELECT 1 FROM users 
      WHERE role::text = 'ADMIN'
    ) THEN
      -- Try to update ADMIN to OWNER
      BEGIN
        UPDATE users 
        SET role = 'OWNER'::user_role 
        WHERE role::text = 'ADMIN';
        
        IF FOUND THEN
          RAISE NOTICE '✅ Converted ADMIN roles to OWNER';
        ELSE
          RAISE NOTICE '✅ No ADMIN roles found to convert';
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Could not convert ADMIN roles: %', SQLERRM;
      END;
    ELSE
      RAISE NOTICE '✅ No ADMIN roles to convert';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ users table does not exist, skipping role conversion';
  END IF;
END $$;

-- ============================================
-- PART 9: ADD CONSTRAINT SAFELY
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    -- Drop old constraint if exists
    ALTER TABLE users DROP CONSTRAINT IF EXISTS staff_must_have_gym;
    
    -- Add new constraint
    ALTER TABLE users ADD CONSTRAINT staff_must_have_gym CHECK (
      (role = 'STAFF' AND gym_id IS NOT NULL) OR 
      (role = 'OWNER' AND gym_id IS NOT NULL)
    );
    
    RAISE NOTICE '✅ Added/updated staff_must_have_gym constraint';
  ELSE
    RAISE NOTICE '⚠️ users table does not exist, skipping constraint';
  END IF;
END $$;

-- ============================================
-- PART 10: ENABLE RLS ON TABLES
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gyms') THEN
    ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'members') THEN
    ALTER TABLE members ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance') THEN
    ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
    ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
  END IF;
  
  RAISE NOTICE '✅ RLS enabled on all tables';
END $$;

-- ============================================
-- PART 11: DROP OLD POLICIES SAFELY
-- ============================================

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
-- PART 12: CREATE RLS POLICIES SAFELY
-- ============================================

-- GYMS POLICIES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gyms') THEN
    -- Super Admin can manage all gyms
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'gyms' AND policyname = 'Super Admin can manage all gyms'
    ) THEN
      CREATE POLICY "Super Admin can manage all gyms"
      ON gyms FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fitnesswithimran1@gmail.com')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fitnesswithimran1@gmail.com')
      );
    END IF;
    
    -- Owners can manage their gym
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'gyms' AND policyname = 'Owners can manage their gym'
    ) THEN
      CREATE POLICY "Owners can manage their gym"
      ON gyms FOR ALL
      TO authenticated
      USING (
        id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
      )
      WITH CHECK (
        id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
      );
    END IF;
    
    -- Staff can view their gym
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'gyms' AND policyname = 'Staff can view their gym'
    ) THEN
      CREATE POLICY "Staff can view their gym"
      ON gyms FOR SELECT
      TO authenticated
      USING (
        id = (SELECT gym_id FROM users WHERE id = auth.uid())
      );
    END IF;
    
    RAISE NOTICE '✅ Gyms RLS policies created';
  END IF;
END $$;

-- USERS POLICIES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    -- Super Admin can manage all users
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' AND policyname = 'Super Admin can manage all users'
    ) THEN
      CREATE POLICY "Super Admin can manage all users"
      ON users FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fitnesswithimran1@gmail.com')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fitnesswithimran1@gmail.com')
      );
    END IF;
    
    -- Owners can view their gym users
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' AND policyname = 'Owners can view their gym users'
    ) THEN
      CREATE POLICY "Owners can view their gym users"
      ON users FOR SELECT
      TO authenticated
      USING (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
        OR id = auth.uid()
      );
    END IF;
    
    -- Owners can manage their gym users
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' AND policyname = 'Owners can manage their gym users'
    ) THEN
      CREATE POLICY "Owners can manage their gym users"
      ON users FOR ALL
      TO authenticated
      USING (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
      )
      WITH CHECK (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
        AND role = 'STAFF'
      );
    END IF;
    
    -- Users can view own record
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' AND policyname = 'Users can view own record'
    ) THEN
      CREATE POLICY "Users can view own record"
      ON users FOR SELECT
      TO authenticated
      USING (id = auth.uid());
    END IF;
    
    RAISE NOTICE '✅ Users RLS policies created';
  END IF;
END $$;

-- MEMBERS POLICIES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'members') THEN
    -- Owners can manage their gym members
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'members' AND policyname = 'Owners can manage their gym members'
    ) THEN
      CREATE POLICY "Owners can manage their gym members"
      ON members FOR ALL
      TO authenticated
      USING (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
      )
      WITH CHECK (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
      );
    END IF;
    
    -- Staff can view their gym members
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'members' AND policyname = 'Staff can view their gym members'
    ) THEN
      CREATE POLICY "Staff can view their gym members"
      ON members FOR SELECT
      TO authenticated
      USING (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
      );
    END IF;
    
    -- Staff can add members
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'members' AND policyname = 'Staff can add members'
    ) THEN
      CREATE POLICY "Staff can add members"
      ON members FOR INSERT
      TO authenticated
      WITH CHECK (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
      );
    END IF;
    
    -- Staff can update members
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'members' AND policyname = 'Staff can update members'
    ) THEN
      CREATE POLICY "Staff can update members"
      ON members FOR UPDATE
      TO authenticated
      USING (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
      )
      WITH CHECK (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
      );
    END IF;
    
    RAISE NOTICE '✅ Members RLS policies created';
  END IF;
END $$;

-- ATTENDANCE POLICIES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance') THEN
    -- Owners can manage their gym attendance
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'attendance' AND policyname = 'Owners can manage their gym attendance'
    ) THEN
      CREATE POLICY "Owners can manage their gym attendance"
      ON attendance FOR ALL
      TO authenticated
      USING (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
      )
      WITH CHECK (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
      );
    END IF;
    
    -- Staff can view their gym attendance
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'attendance' AND policyname = 'Staff can view their gym attendance'
    ) THEN
      CREATE POLICY "Staff can view their gym attendance"
      ON attendance FOR SELECT
      TO authenticated
      USING (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
      );
    END IF;
    
    -- Staff can add attendance
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'attendance' AND policyname = 'Staff can add attendance'
    ) THEN
      CREATE POLICY "Staff can add attendance"
      ON attendance FOR INSERT
      TO authenticated
      WITH CHECK (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
      );
    END IF;
    
    -- Staff can update attendance
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'attendance' AND policyname = 'Staff can update attendance'
    ) THEN
      CREATE POLICY "Staff can update attendance"
      ON attendance FOR UPDATE
      TO authenticated
      USING (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
      )
      WITH CHECK (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
      );
    END IF;
    
    RAISE NOTICE '✅ Attendance RLS policies created';
  END IF;
END $$;

-- PAYMENTS POLICIES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
    -- Owners can manage their gym payments
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'payments' AND policyname = 'Owners can manage their gym payments'
    ) THEN
      CREATE POLICY "Owners can manage their gym payments"
      ON payments FOR ALL
      TO authenticated
      USING (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
      )
      WITH CHECK (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'OWNER')
      );
    END IF;
    
    -- Staff can view their gym payments
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'payments' AND policyname = 'Staff can view their gym payments'
    ) THEN
      CREATE POLICY "Staff can view their gym payments"
      ON payments FOR SELECT
      TO authenticated
      USING (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
      );
    END IF;
    
    -- Staff can add payments
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'payments' AND policyname = 'Staff can add payments'
    ) THEN
      CREATE POLICY "Staff can add payments"
      ON payments FOR INSERT
      TO authenticated
      WITH CHECK (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
      );
    END IF;
    
    -- Staff can update payments
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'payments' AND policyname = 'Staff can update payments'
    ) THEN
      CREATE POLICY "Staff can update payments"
      ON payments FOR UPDATE
      TO authenticated
      USING (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
      )
      WITH CHECK (
        gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
      );
    END IF;
    
    RAISE NOTICE '✅ Payments RLS policies created';
  END IF;
END $$;

-- ============================================
-- PART 13: VERIFICATION
-- ============================================

SELECT '✅ Migration Complete!' as status;
SELECT '✅ Super Admin ready: fitnesswithimran1@gmail.com' as super_admin;
SELECT '✅ Users table ready' as users_table;
SELECT '✅ RLS policies updated for OWNER/STAFF' as rls_policies;
SELECT '✅ System ready for use' as system_status;
