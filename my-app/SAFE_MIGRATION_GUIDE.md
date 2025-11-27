# ✅ Safe Migration Guide: ADMIN → OWNER/STAFF

## Quick Start

### Step 1: Open Supabase SQL Editor
1. Go to **Supabase Dashboard**
2. Click **SQL Editor** (left sidebar)
3. Click **New query**

### Step 2: Copy Script
1. Open file: `supabase/10-SAFE_MIGRATION_OWNER_STAFF.sql`
2. **Copy entire script** (Ctrl+A, Ctrl+C)

### Step 3: Run Script
1. **Paste** script into SQL Editor
2. Click **Run** (or press F5)
3. Wait for completion

---

## What the Script Does (In Order)

### ✅ 1. Enum Setup
- Creates `user_role` enum if missing
- Adds `OWNER` and `STAFF` values safely
- **No data loss** - uses `ADD VALUE IF NOT EXISTS`

### ✅ 2. Gyms Table
- Creates `gyms` table if missing
- Columns: `id`, `name`, `created_at`, `updated_at`

### ✅ 3. Users Table
- Creates `users` table if missing
- Ensures columns: `id`, `email`, `role`, `gym_id`
- Links to `auth.users` if available
- Links to `gyms` if available

### ✅ 4. Add gym_id to Related Tables
- **Members table**: Adds `gym_id` column if missing
- **Attendance table**: Adds `gym_id` column if missing
- **Payments table**: Adds `gym_id` column if missing
- Adds foreign key constraints safely

### ✅ 5. Insert Super Admin
- Email: `fitnesswithimran1@gmail.com`
- Role: `OWNER`
- Uses `ON CONFLICT DO NOTHING/UPDATE`
- Tries to link with `auth.users` if available

### ✅ 6. Convert ADMIN → OWNER
- Only runs if `users` table exists
- Updates: `UPDATE users SET role = 'OWNER' WHERE role = 'ADMIN'`
- Safe text comparison
- No accidental overwrite

### ✅ 7. Add Constraints
- Adds `staff_must_have_gym` constraint
- Ensures:
  - `STAFF` must have `gym_id`
  - `OWNER` must have `gym_id`

### ✅ 8. Enable RLS
- Enables Row Level Security on:
  - `gyms`
  - `users`
  - `members`
  - `attendance`
  - `payments`

### ✅ 9. Create RLS Policies

#### Gyms Policies:
- **Super Admin**: Full access to all gyms
- **Owner**: Full access to their gym
- **Staff**: Read-only access to their gym

#### Users Policies:
- **Super Admin**: Full access to all users
- **Owner**: View/manage users in their gym (can create STAFF only)
- **Users**: View own record

#### Members Policies:
- **Owner**: Full CRUD on their gym's members
- **Staff**: SELECT, INSERT, UPDATE only (DELETE blocked)

#### Attendance Policies:
- **Owner**: Full CRUD on their gym's attendance
- **Staff**: SELECT, INSERT, UPDATE only (DELETE blocked)

#### Payments Policies:
- **Owner**: Full CRUD on their gym's payments
- **Staff**: SELECT, INSERT, UPDATE only (DELETE blocked)

---

## Expected Output

When you run the script, you should see:

```
✅ Created user_role enum with OWNER and STAFF
✅ Created gyms table
✅ Created users table
✅ Added gym_id column to members table
✅ Added gym_id column to attendance table
✅ Added gym_id column to payments table
✅ Super Admin inserted/updated
✅ Converted ADMIN roles to OWNER
✅ Added/updated staff_must_have_gym constraint
✅ RLS enabled on all tables
✅ Gyms RLS policies created
✅ Users RLS policies created
✅ Members RLS policies created
✅ Attendance RLS policies created
✅ Payments RLS policies created
✅ Migration Complete!
✅ Super Admin ready: fitnesswithimran1@gmail.com
✅ Users table ready
✅ RLS policies updated for OWNER/STAFF
✅ System ready for use
```

---

## Post-Run Verification

### 1. Verify Super Admin
- **Login** as: `fitnesswithimran1@gmail.com`
- **Should access**: `/admin` dashboard
- **Can do**: Create gyms, create owners, manage all users

### 2. Verify Owner
- **Login** as any owner account
- **Should access**: `/owner` dashboard
- **Can do**: 
  - Full CRUD on their gym's data
  - Create/manage staff
  - Delete members/payments/attendance

### 3. Verify Staff
- **Login** as any staff account
- **Should access**: `/staff` dashboard
- **Can do**:
  - ✅ Add members
  - ✅ Add payments
  - ✅ Mark attendance
  - ✅ View/update data
- **Cannot do**:
  - ❌ Delete members (RLS blocks)
  - ❌ Delete payments (RLS blocks)
  - ❌ Delete attendance (RLS blocks)
  - ❌ Manage staff
  - ❌ Access other gyms

---

## Safety Features

### ✅ Idempotent
- Can run **multiple times** without errors
- Checks existence before creating/updating
- No duplicate data

### ✅ Data Preservation
- **Never drops** existing data
- Uses `IF NOT EXISTS` checks
- Safe enum operations

### ✅ Error Handling
- Skips operations if prerequisites missing
- Graceful error messages
- No script failures

### ✅ Safe Operations
- `ON CONFLICT DO NOTHING/UPDATE`
- `ADD VALUE IF NOT EXISTS`
- `DROP CONSTRAINT IF EXISTS`
- `CREATE POLICY IF NOT EXISTS`

---

## Troubleshooting

### Issue: "relation users does not exist"
**Solution**: Script now creates `users` table first before any UPDATE operations.

### Issue: "enum value already exists"
**Solution**: Script uses `ADD VALUE IF NOT EXISTS` - safe to ignore.

### Issue: "constraint already exists"
**Solution**: Script uses `DROP CONSTRAINT IF EXISTS` before creating.

### Issue: "policy already exists"
**Solution**: Script checks existence before creating policies.

---

## Next Steps After Migration

1. **Create Super Admin User** (if not exists):
   - Visit: `/login-diagnostic`
   - Click: "Create Admin User"
   - Or create manually in Supabase Auth

2. **Test Login**:
   - Super Admin → `/admin`
   - Owner → `/owner`
   - Staff → `/staff`

3. **Create Test Data**:
   - Super Admin: Create gym → Create owner
   - Owner: Create staff → Add members
   - Staff: Test add/update (verify delete is blocked)

---

## File Location

**Script**: `supabase/10-SAFE_MIGRATION_OWNER_STAFF.sql`

**Status**: ✅ Ready to use
**Safety**: ✅ Fully idempotent
**Data Loss**: ✅ Zero risk

---

## Support

If you encounter any issues:
1. Check the error message
2. Verify tables exist in Supabase
3. Check if Super Admin user exists in `auth.users`
4. Re-run script (it's safe to run multiple times)


