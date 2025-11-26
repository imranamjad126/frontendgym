# Upgrade Instructions - Purane Schema se Multi-User System

## ⚠️ Important: Purana Data Delete Ho Jayega!

Agar aapne pehle wala schema run kiya hai, to naya multi-user schema run karne se:
- ❌ Purane `members` table delete ho jayega
- ❌ Purane `attendance` data delete ho jayega  
- ❌ Purane `payments` data delete ho jayega

**Agar purana data important hai, to pehle backup lein!**

---

## Step-by-Step Upgrade

### Step 1: Supabase SQL Editor me Naya Schema Run Karein

1. **Supabase Dashboard kholen:**
   - https://supabase.com/dashboard
   - Apna project select karein

2. **SQL Editor → New Query:**
   - Left sidebar me "SQL Editor" click karein
   - "New Query" button click karein

3. **File Open Karein:**
   - File: `supabase/04-UPGRADE_TO_MULTI_USER.sql`
   - Saara code copy karein

4. **SQL Editor me Paste Karein:**
   - Copy kiya hua code paste karein

5. **Run Karein:**
   - "Run" button click karein (ya Ctrl+Enter press karein)
   - Wait karein complete hone tak

6. **Verify:**
   - Result me "✅ Multi-user setup complete!" dikhna chahiye
   - Tables list me dikhna chahiye: `gyms`, `users`, `members`, `attendance`, `payments`

---

### Step 2: Admin User Create Karein

1. **Authentication → Users:**
   - Supabase Dashboard me "Authentication" → "Users"
   - "Add User" → "Create new user"

2. **Fill Karein:**
   ```
   Email: fitnesswithimran1@gmail.com
   Password: Aa543543@
   Auto Confirm User: ✅ YES
   ```

3. **Create User:**
   - "Create user" click karein
   - User ko open karein
   - "Email Confirmed" = TRUE set karein

---

### Step 3: Users Table me Admin Record Create Karein

**SQL Editor me ye run karein:**

```sql
INSERT INTO users (id, email, role, gym_id)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'fitnesswithimran1@gmail.com'),
  'fitnesswithimran1@gmail.com',
  'ADMIN',
  NULL
)
ON CONFLICT (id) DO UPDATE
SET role = 'ADMIN', gym_id = NULL;
```

**Ya** `supabase/03-quick-admin-setup.sql` file run karein (ye automatically sab karega)

---

### Step 4: Verify Setup

**Check Tables:**
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Expected: `attendance`, `gyms`, `members`, `payments`, `users`

**Check Admin User:**
```sql
SELECT * FROM users WHERE email = 'fitnesswithimran1@gmail.com';
```

Expected: `role = 'ADMIN'`, `gym_id = NULL`

---

### Step 5: Login Test Karein

1. Browser me jayein: `http://localhost:3000/login`
2. Email: `fitnesswithimran1@gmail.com`
3. Password: `Aa543543@`
4. Login karein

---

## Differences: Purana vs Naya Schema

### Purana Schema (Jo aapne run kiya):
- ❌ `gyms` table nahi hai
- ❌ `users` table nahi hai
- ❌ `members` me `gym_id` nahi hai
- ❌ Multi-user support nahi hai
- ❌ Role-based access control nahi hai

### Naya Schema (Multi-User):
- ✅ `gyms` table hai (multiple gyms support)
- ✅ `users` table hai (ADMIN/STAFF roles)
- ✅ `members` me `gym_id` hai (gym-wise filtering)
- ✅ `attendance` me `gym_id` hai
- ✅ `payments` me `gym_id` hai
- ✅ RLS policies (staff sirf apne gym ka data dekh sakte hain)
- ✅ Admin sab kuch dekh sakta hai

---

## Quick Checklist

- [ ] `04-UPGRADE_TO_MULTI_USER.sql` run ho chuka hai
- [ ] Tables verify ho chuki hain (5 tables: gyms, users, members, attendance, payments)
- [ ] Admin user Supabase Auth me create ho chuka hai
- [ ] Users table me admin record hai
- [ ] Login test successful hai

---

## Troubleshooting

### ❌ "Table already exists" error?
- Purane tables delete nahi hui
- `04-UPGRADE_TO_MULTI_USER.sql` me `DROP TABLE` commands hain
- Script dobara run karein

### ❌ "Foreign key constraint" error?
- Pehle `gyms` table create honi chahiye
- Script ko top se bottom tak run karein
- Agar error aaye to puri script dobara run karein

### ❌ Login nahi ho raha?
- Admin user create ho chuka hai? (Authentication → Users check karein)
- Email confirmed hai? (Email Confirmed = TRUE)
- Users table me record hai? (SQL query se verify karein)

---

## Next Steps After Upgrade

1. ✅ Pehli gym create karein (Admin Dashboard → Gyms)
2. ✅ Staff members add karein (Admin Dashboard → Staff)
3. ✅ Staff ko gym assign karein
4. ✅ Members add karein (Staff Dashboard se)

**System ab multi-user ready hai!** 🎉

