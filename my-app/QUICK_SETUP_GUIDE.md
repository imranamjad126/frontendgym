# 🚀 Quick Setup Guide - Fresh Supabase Schema

## Overview
This guide will help you clean your existing Supabase project and rebuild it with the correct schema.

---

## ⚠️ IMPORTANT: Run Scripts in Order

### Step 1: Clean Everything
1. Supabase Dashboard → SQL Editor → New Query
2. Open: `supabase/01-cleanup.sql`
3. Copy ALL code → Paste → Run
4. ✅ This deletes ALL existing tables, policies, functions

### Step 2: Create Schema
1. SQL Editor → New Query
2. Open: `supabase/02-create-schema.sql`
3. Copy ALL code → Paste → Run
4. ✅ Creates: members, attendance, payments tables

### Step 3: Setup RLS
1. SQL Editor → New Query
2. Open: `supabase/03-rls-policies.sql`
3. Copy ALL code → Paste → Run
4. ✅ Enables RLS and creates policies

### Step 4: Verify
1. SQL Editor → New Query
2. Open: `supabase/04-verify-schema.sql`
3. Copy ALL code → Paste → Run
4. ✅ Check results - should show 3 tables

---

## 🔑 Environment Variables

1. Create `.env.local` in project root
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

3. Get credentials from: Supabase Dashboard → Settings → API

---

## 📋 Schema Created

### members
- id (uuid, pk)
- name, phone, gender, cnic
- membership_type, ac_type, amount
- start_date, expiry_date, status
- created_at

### attendance
- id (uuid, pk)
- member_id (uuid, fk)
- date

### payments
- id (uuid, pk)
- member_id (uuid, fk)
- amount, method, date

---

## ✅ CRUD Functions Ready

All functions are in `lib/supabase-new/`:
- Members: addMember, updateMember, deleteMember, getMembersByStatus, etc.
- Attendance: recordAttendance, getMemberAttendance, etc.
- Payments: recordPayment, getMemberPayments, etc.

---

**Follow the steps above to complete setup!**



