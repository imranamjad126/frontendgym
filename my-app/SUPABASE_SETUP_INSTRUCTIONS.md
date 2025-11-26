# Supabase Setup Instructions

## Step 1: Clean Your Existing Supabase Project

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your existing project
3. Go to **SQL Editor** → **New Query**
4. Open file: `supabase/01-cleanup.sql`
5. **Copy ALL the SQL code** and paste into SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for "Success" message

**This will delete ALL existing tables, policies, functions, and triggers.**

---

## Step 2: Create Fresh Schema

1. In SQL Editor, click **New Query**
2. Open file: `supabase/02-create-schema.sql`
3. **Copy ALL the SQL code** and paste into SQL Editor
4. Click **Run**
5. Wait for "Success" message

**This creates the 3 tables: members, attendance, payments**

---

## Step 3: Create RLS Policies

1. In SQL Editor, click **New Query**
2. Open file: `supabase/03-rls-policies.sql`
3. **Copy ALL the SQL code** and paste into SQL Editor
4. Click **Run**
5. Wait for "Success" message

**This enables RLS and creates policies for public access**

---

## Step 4: Verify Schema

1. In SQL Editor, click **New Query**
2. Open file: `supabase/04-verify-schema.sql`
3. **Copy ALL the SQL code** and paste into SQL Editor
4. Click **Run**
5. Check the results - should show:
   - 3 tables: members, attendance, payments
   - All columns correctly defined
   - RLS enabled on all tables
   - Policies created

---

## Step 5: Get Your Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy **Project URL**
3. Copy **anon public** key

---

## Step 6: Configure Environment Variables

1. In your project root, create `.env.local` file (if it doesn't exist)
2. Copy the content from `.env.example`
3. Paste your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL="your-project-url-here"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

4. **DO NOT commit `.env.local` to git** (it's already in .gitignore)

---

## Step 7: Restart Dev Server

1. Stop the current dev server (Ctrl+C)
2. Run: `npm run dev`
3. Open: `http://localhost:3000`

---

## Schema Overview

### Table: members
- id (uuid, primary key)
- name (text)
- phone (text)
- gender (text, nullable)
- cnic (text, nullable)
- membership_type (text)
- ac_type (text)
- amount (integer)
- start_date (date)
- expiry_date (date)
- status (text)
- created_at (timestamp)

### Table: attendance
- id (uuid, primary key)
- member_id (uuid, foreign key → members.id)
- date (date)
- Unique constraint: (member_id, date)

### Table: payments
- id (uuid, primary key)
- member_id (uuid, foreign key → members.id)
- amount (integer)
- method (text)
- date (date)

---

## CRUD Functions Available

### Members:
- `addMember()` - Add new member
- `updateMember()` - Update member
- `deleteMember()` - Delete member
- `getAllMembers()` - Get all members
- `getMembersByStatus()` - Get members by status
- `getMemberById()` - Get single member
- `freezeMember()` - Mark as freeze
- `inactiveMember()` - Mark as inactive
- `unpaidMember()` - Mark as unpaid
- `dormantMember()` - Mark as dormant

### Attendance:
- `recordAttendance()` - Record attendance
- `getMemberAttendance()` - Get member's attendance
- `getAttendanceByDate()` - Get attendance for date
- `hasAttendance()` - Check if marked

### Payments:
- `recordPayment()` - Record payment
- `getMemberPayments()` - Get member's payments
- `getPaymentsByDateRange()` - Get payments in range
- `getMemberTotalPayments()` - Get total for member

---

## Files Created

- `supabase/01-cleanup.sql` - Cleanup script
- `supabase/02-create-schema.sql` - Schema creation
- `supabase/03-rls-policies.sql` - RLS policies
- `supabase/04-verify-schema.sql` - Verification script
- `lib/types/member-new.ts` - TypeScript types
- `lib/supabase-new/client.ts` - Supabase client
- `lib/supabase-new/members.ts` - Members CRUD
- `lib/supabase-new/attendance.ts` - Attendance operations
- `lib/supabase-new/payments.ts` - Payment operations
- `.env.example` - Environment template

---

## Next Steps

After completing setup:
1. Test connection using the new CRUD functions
2. Update frontend to use new schema
3. Test all operations

---

**Ready to start? Begin with Step 1!**



