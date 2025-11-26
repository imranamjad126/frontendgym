# Supabase Troubleshooting Guide

## Common Error: "Error fetching members from Supabase: {}"

This error usually means one of the following:

### 1. **Table Doesn't Exist** (Most Common)

**Solution:**
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the SQL from `supabase-setup.sql`
5. Click **Run** (or press Ctrl+Enter)

**Verify:**
- Go to **Table Editor** in Supabase
- You should see a `members` table

### 2. **Row Level Security (RLS) Blocking Access**

**Solution:**
Run this in SQL Editor:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'members';

-- If rowsecurity is true but no policies exist, create one:
CREATE POLICY "Allow all operations for anon users"
ON members
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
```

### 3. **Incorrect Table Name or Schema**

**Check:**
- Table name should be exactly `members` (lowercase)
- Table should be in `public` schema

**Verify:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'members';
```

### 4. **API Key Issues**

**Check:**
- Verify your Supabase URL is correct
- Verify your anon key is correct
- Check `lib/supabase.ts` has the right credentials

**Test Connection:**
```typescript
// Add this temporarily to test
import { supabase } from '@/lib/supabase';

// Test query
const { data, error } = await supabase.from('members').select('count');
console.log('Connection test:', { data, error });
```

### 5. **Network/CORS Issues**

**Check Browser Console:**
- Look for CORS errors
- Check Network tab for failed requests

**Solution:**
- Supabase usually handles CORS automatically
- If issues persist, check Supabase Dashboard → Settings → API

## Step-by-Step Setup

### Step 1: Create Table
```sql
CREATE TABLE members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  plan TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL,
  gender TEXT,
  fee_amount NUMERIC,
  fee_paid BOOLEAN DEFAULT false,
  fee_paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at DATE,
  frozen_date DATE
);
```

### Step 2: Enable RLS
```sql
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
```

### Step 3: Create Policy
```sql
CREATE POLICY "Allow all operations for anon users"
ON members
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
```

### Step 4: Verify
```sql
-- Should return 1 row
SELECT COUNT(*) FROM members;
```

## Testing Connection

Add this to any component temporarily:

```typescript
useEffect(() => {
  const testConnection = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('count');
    
    console.log('Supabase Connection Test:', { data, error });
    
    if (error) {
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }
  };
  
  testConnection();
}, []);
```

## Common Error Codes

- **42P01**: Table doesn't exist
- **42501**: Permission denied (RLS issue)
- **PGRST116**: Table not found
- **PGRST301**: RLS policy violation

## Quick Fix Checklist

- [ ] Table `members` exists in Supabase
- [ ] RLS is enabled
- [ ] Policy exists for `anon` role
- [ ] Supabase URL is correct in `lib/supabase.ts`
- [ ] Supabase anon key is correct
- [ ] No typos in table/column names
- [ ] Browser console shows detailed error

## Still Having Issues?

1. **Check Supabase Logs:**
   - Dashboard → Logs → API Logs
   - Look for error messages

2. **Test with Supabase Client:**
   ```typescript
   import { supabase } from '@/lib/supabase';
   
   // Direct test
   const test = async () => {
     const { data, error } = await supabase.from('members').select('*');
     console.log({ data, error });
   };
   ```

3. **Verify Credentials:**
   - Go to Supabase Dashboard → Settings → API
   - Copy Project URL and anon key
   - Verify they match `lib/supabase.ts`

4. **Check Network Tab:**
   - Open browser DevTools → Network
   - Look for requests to Supabase
   - Check response for error details



