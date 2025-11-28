# 🔍 Session & Cookie Verification Guide

## ✅ Current Implementation Status

### 1. AuthContext Loading State ✅

**File**: `lib/contexts/AuthContext.tsx`

**Status**: ✅ Properly implemented
- `loading` state starts as `true`
- Set to `false` after `loadUser()` completes
- Set to `false` on auth state change
- Prevents premature rendering

**Code:**
```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadUser(); // Sets loading to false when done
  onAuthStateChange((user) => {
    setUser(user);
    setLoading(false); // Sets loading to false on change
  });
}, []);
```

---

### 2. Layout Component Wrapping ✅

**File**: `app/(protected)/layout.tsx`

**Status**: ✅ Fixed
- Protected routes wrapped with Layout
- Loading state check in ProtectedLayout
- Public routes (like `/login`) NOT wrapped with Layout

**Structure:**
```
app/
  layout.tsx          → AuthProvider only (no Layout)
  (protected)/
    layout.tsx        → Layout wrapper with loading check
    admin/
    owner/
    staff/
  login/
    page.tsx          → No Layout (public route)
```

**Code:**
```typescript
// app/(protected)/layout.tsx
export default function ProtectedLayout({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return <Layout>{children}</Layout>;
}
```

---

### 3. Middleware Cookie Persistence ✅

**File**: `middleware.ts`

**Status**: ✅ Properly configured
- Uses `@supabase/ssr` `createServerClient`
- Cookie handlers properly set up
- Cookies are set/removed via Supabase SSR

**Code:**
```typescript
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  }
);
```

---

## 🔍 How to Verify Cookies & Session

### Step 1: Check Browser DevTools

1. **Open DevTools** (F12)
2. **Go to Application tab** (Chrome) or **Storage tab** (Firefox)
3. **Click on Cookies** → Your domain
4. **Look for Supabase cookies:**
   - `sb-<project-ref>-auth-token`
   - `sb-<project-ref>-auth-token.0`
   - `sb-<project-ref>-auth-token.1`
   - `sb-<project-ref>-auth-token.2`

**Expected:**
- ✅ Cookies exist after login
- ✅ Cookies have expiration date
- ✅ Cookies are `HttpOnly` and `Secure` (if HTTPS)

---

### Step 2: Check Network Tab

1. **Open DevTools** → **Network tab**
2. **Login** with credentials
3. **Look for requests:**
   - `/auth/v1/token` → Should return 200
   - Any middleware request → Check response headers

4. **Check Response Headers:**
   ```
   Set-Cookie: sb-xxx-auth-token=...; Path=/; HttpOnly; Secure; SameSite=Lax
   ```

**Expected:**
- ✅ `Set-Cookie` headers present
- ✅ Status 200
- ✅ Valid session JSON in response

---

### Step 3: Check Session JSON

1. **Network tab** → Find `/auth/v1/token` request
2. **Click on it** → **Response tab**
3. **Check JSON structure:**
   ```json
   {
     "access_token": "...",
     "token_type": "bearer",
     "expires_in": 3600,
     "refresh_token": "...",
     "user": {
       "id": "...",
       "email": "...",
       ...
     }
   }
   ```

**Expected:**
- ✅ Valid access_token
- ✅ User object present
- ✅ Expires_in > 0

---

### Step 4: Check localStorage (Client-side)

1. **DevTools** → **Application** → **Local Storage**
2. **Select your domain**
3. **Look for:**
   - `sb-<project-ref>-auth-token` (if using localStorage)

**Note:** Supabase SSR uses cookies by default, not localStorage.

---

## 🐛 Debugging Tips

### Issue: Cookies Not Set

**Symptoms:**
- Login succeeds but redirects back to `/login`
- Session not persisting
- `Set-Cookie` headers missing

**Debug Steps:**
1. Check Network tab → Look for `Set-Cookie` in response headers
2. Check Application tab → Verify cookies exist
3. Check middleware → Verify cookie handlers are called
4. Check environment variables → `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Fix:**
- Ensure middleware cookie handlers are properly set up
- Check if domain/subdomain matches
- Verify HTTPS is used (cookies require Secure flag on HTTPS)

---

### Issue: Session Stale

**Symptoms:**
- User logged in but shows as logged out
- Dashboard redirects to login
- Session expires too quickly

**Debug Steps:**
1. Check cookie expiration date
2. Check `expires_in` in session JSON
3. Verify `autoRefreshToken` is enabled in Supabase client

**Fix:**
- Ensure `autoRefreshToken: true` in Supabase client config
- Check token refresh logic
- Verify session refresh on page load

---

### Issue: Infinite Redirect Loop

**Symptoms:**
- Page keeps redirecting between `/login` and dashboard
- Browser console shows multiple redirects

**Debug Steps:**
1. Check middleware → Verify session check logic
2. Check AuthContext → Verify loading state
3. Check Layout → Verify loading check prevents rendering

**Fix:**
- Ensure loading state is checked before redirects
- Verify middleware doesn't redirect unnecessarily
- Check if session is properly loaded before UI renders

---

## ✅ Verification Checklist

### After Login:

- [ ] Cookies set in browser (Application tab)
- [ ] `Set-Cookie` headers in Network tab
- [ ] Session JSON valid (access_token present)
- [ ] User data fetched correctly
- [ ] Redirect to correct dashboard
- [ ] No infinite loops
- [ ] Session persists on page refresh

### After Page Refresh:

- [ ] Cookies still present
- [ ] User still logged in
- [ ] Dashboard loads correctly
- [ ] No redirect to login
- [ ] Session data correct

### After Logout:

- [ ] Cookies removed
- [ ] Redirected to `/login`
- [ ] Cannot access protected routes
- [ ] Session cleared

---

## 📊 Expected Cookie Structure

### Supabase Auth Cookies:

```
Name: sb-<project-ref>-auth-token
Value: <encrypted-token>
Domain: <your-domain>
Path: /
Expires: <future-date>
HttpOnly: true
Secure: true (if HTTPS)
SameSite: Lax
```

### Multiple Cookies:

Supabase may split large tokens into multiple cookies:
- `sb-xxx-auth-token.0`
- `sb-xxx-auth-token.1`
- `sb-xxx-auth-token.2`

This is normal and expected.

---

## 🔧 Quick Test Commands

### Test Session in Browser Console:

```javascript
// Check if session exists
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Check current user
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

### Test Cookies:

```javascript
// List all cookies
document.cookie.split(';').forEach(c => console.log(c.trim()));
```

---

## ✅ Status

- ✅ **AuthContext**: Loading state properly implemented
- ✅ **Layout**: Wraps protected routes only
- ✅ **Loading Check**: Prevents premature rendering
- ✅ **Middleware**: Cookie persistence configured
- ✅ **Session**: Properly managed by Supabase SSR

---

**Next Steps:**
1. Deploy to production
2. Test login flow
3. Verify cookies in DevTools
4. Check Network tab for Set-Cookie headers
5. Test session persistence



