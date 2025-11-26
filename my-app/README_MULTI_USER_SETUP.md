# Multi-User Gym Management System Setup

## Overview
This system supports multiple gyms with role-based access control:
- **ADMIN**: Can manage all gyms, staff, and members
- **STAFF**: Can only manage members from their assigned gym

## Setup Instructions

### 1. Database Setup

#### Step 1: Run Multi-User Schema
1. Go to Supabase Dashboard → SQL Editor → New Query
2. Open `supabase/01-multi-user-setup.sql`
3. Copy ALL the SQL code and paste into SQL Editor
4. Click **Run**
5. Wait for "✅ Multi-user setup complete!" message

#### Step 2: Create Admin User in Supabase Auth
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter:
   - Email: `fitnesswithimran1@gmail.com`
   - Password: `Aa543543@`
   - Auto Confirm User: **Yes**
4. Click "Create user"
5. Copy the user ID (you'll need it for next step)

#### Step 3: Create Admin User Record
1. In SQL Editor, run:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com';
   ```
2. Copy the `id` value
3. Open `supabase/02-create-admin-user.sql`
4. The script will automatically find the user ID, just run it
5. Verify: `SELECT * FROM users WHERE email = 'fitnesswithimran1@gmail.com';`

### 2. Environment Variables

Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Login

1. Navigate to `http://localhost:3000/login`
2. Login with:
   - Email: `fitnesswithimran1@gmail.com`
   - Password: `Aa543543@`

## Features

### Admin Features
- **Admin Dashboard** (`/admin`): Overview of all gyms and staff
- **Gyms Management** (`/admin/gyms`): Create and manage gyms
- **Staff Management** (`/admin/staff`): Create staff and assign to gyms
- Can access all gym data

### Staff Features
- **Staff Dashboard** (`/staff`): Overview of their gym
- **Members** (`/staff/members`): View and manage members from their gym only
- **Add Member** (`/staff/members/new`): Register new members
- **Attendance** (`/staff/attendance`): Mark daily attendance
- **Payments** (`/staff/balance`): View payments and balance

## Database Schema

### Tables
- `gyms`: Gym locations
- `users`: User accounts with roles (ADMIN/STAFF) and gym assignments
- `members`: Gym members (includes `gym_id`)
- `attendance`: Attendance records (includes `gym_id`)
- `payments`: Payment records (includes `gym_id`)

### Row Level Security (RLS)
- All tables have RLS enabled
- Staff can only access data from their assigned gym
- Admins can access all data

## API Routes Protection

All routes are protected:
- `/admin/*` - ADMIN only
- `/staff/*` - STAFF and ADMIN
- Unauthenticated users are redirected to `/login`

## Troubleshooting

### Admin user not found
- Verify user exists in `auth.users` table
- Check `users` table has the admin record
- Ensure role is set to 'ADMIN'

### Staff can't see members
- Verify staff has `gym_id` assigned
- Check members have correct `gym_id`
- Verify RLS policies are active

### Build errors
- Run `npm run build` to check for TypeScript errors
- Ensure all environment variables are set
- Check Supabase connection


