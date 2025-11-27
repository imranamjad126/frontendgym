# Migration to OWNER/STAFF System

## Overview

System has been migrated from ADMIN/STAFF to OWNER/STAFF with Super Admin support.

## Changes Made

### 1. Database Migration
- **File:** `supabase/08-MIGRATE_TO_OWNER_STAFF.sql`
- Updated `user_role` enum: `ADMIN` → `OWNER`
- Updated all existing ADMIN users to OWNER
- Updated RLS policies for OWNER (full access) and STAFF (limited access)

### 2. TypeScript Types
- **File:** `lib/auth/types.ts`
- Changed `UserRole` from `'ADMIN' | 'STAFF'` to `'OWNER' | 'STAFF'`

### 3. Middleware
- **File:** `middleware.ts`
- Super Admin: `fitnesswithimran1@gmail.com` → `/admin` routes
- OWNER → `/owner` routes (full access to their gym)
- STAFF → `/staff` routes (limited access, no delete)

### 4. Routes Structure

#### Super Admin Routes (`/admin/*`)
- `/admin` - Super Admin Dashboard
- `/admin/gyms` - Manage all gyms
- `/admin/owners` - Create and manage owners

#### Owner Routes (`/owner/*`)
- `/owner` - Owner Dashboard (full access)
- `/owner/staff` - Manage staff for their gym

#### Staff Routes (`/staff/*`)
- `/staff` - Staff Dashboard (limited access)
- `/staff/members` - View and add members (no delete)
- `/staff/members/new` - Add new members
- `/staff/attendance` - Mark attendance
- `/staff/balance` - View payments

### 5. Access Control

#### OWNER Permissions:
✅ Full access to their gym's data
✅ Create/update/delete members
✅ Create/update/delete attendance
✅ Create/update/delete payments
✅ Create/manage staff
✅ View all gym statistics

#### STAFF Permissions:
✅ Add members
✅ Add payments
✅ Mark attendance
✅ View members
✅ Update members
❌ Delete members (RLS blocks this)
❌ Delete attendance (RLS blocks this)
❌ Delete payments (RLS blocks this)
❌ Manage staff
❌ View other gyms

### 6. RLS Policies

#### Members Table:
- **OWNER:** Full CRUD on their gym's members
- **STAFF:** SELECT, INSERT, UPDATE only (no DELETE)

#### Attendance Table:
- **OWNER:** Full CRUD on their gym's attendance
- **STAFF:** SELECT, INSERT, UPDATE only (no DELETE)

#### Payments Table:
- **OWNER:** Full CRUD on their gym's payments
- **STAFF:** SELECT, INSERT, UPDATE only (no DELETE)

#### Users Table:
- **OWNER:** Can view and create STAFF for their gym
- **STAFF:** Can view their own record only

## Migration Steps

1. **Run SQL Migration:**
   ```sql
   -- Run in Supabase SQL Editor
   -- File: supabase/08-MIGRATE_TO_OWNER_STAFF.sql
   ```

2. **Update Your Super Admin User:**
   - Ensure `fitnesswithimran1@gmail.com` exists in Supabase Auth
   - This user will have access to `/admin` routes

3. **Create Owner Users:**
   - Use Super Admin dashboard (`/admin/owners`)
   - Or create manually in Supabase

4. **Test Access:**
   - Super Admin → `/admin`
   - Owner → `/owner`
   - Staff → `/staff`

## Files Updated

- `lib/auth/types.ts` - UserRole enum
- `middleware.ts` - Route protection
- `app/page.tsx` - Home redirect logic
- `app/admin/*` - Super admin pages
- `app/owner/*` - Owner pages (new)
- `app/staff/*` - Staff pages (updated)
- `components/layout/Sidebar.tsx` - Navigation
- `lib/middleware/rbac.ts` - RBAC helpers

## Breaking Changes

⚠️ **All ADMIN role checks have been replaced with OWNER**
⚠️ **Super Admin is identified by email, not role**
⚠️ **RLS policies now enforce STAFF limitations**

## Next Steps

1. Run SQL migration in Supabase
2. Test super admin access
3. Create test owner account
4. Create test staff account
5. Verify all access controls work correctly


