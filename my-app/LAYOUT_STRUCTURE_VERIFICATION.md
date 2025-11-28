# ✅ Layout Structure Verification

## Current Structure

```
app/
  layout.tsx              → AuthProvider only (no Layout)
  (protected)/
    layout.tsx            → Layout wrapper with loading check
    (routes should be here but currently at root level)
  login/
    page.tsx              → No Layout (public route)
  admin/                  → Currently at root (needs Layout)
  owner/                  → Currently at root (needs Layout)
  staff/                  → Currently at root (needs Layout)
```

## ⚠️ Issue Identified

Protected routes (`/admin`, `/owner`, `/staff`) are **NOT** in the `(protected)` folder. They're at the root level.

This means:
- ❌ They're not using `(protected)/layout.tsx`
- ❌ They're using root `layout.tsx` which now only has `AuthProvider`
- ❌ They don't have Layout wrapper

## ✅ Solution Applied

**Option 1: Keep routes at root, add Layout back to root with conditional rendering**

**Option 2: Move routes to (protected) folder** (Recommended but requires file moves)

**Current Fix:**
- Root layout: Only `AuthProvider`
- ProtectedLayout: Has `Layout` with loading check
- But routes need to be in `(protected)` folder to use it

## 🔧 Quick Fix: Add Layout Back to Root (Conditional)

Since routes are at root level, we need Layout in root layout but only for protected routes.

**File**: `app/layout.tsx`

```typescript
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**File**: `components/layout/ConditionalLayout.tsx` (NEW)

```typescript
'use client';

import { usePathname } from 'next/navigation';
import { Layout } from './Layout';
import { useAuth } from '@/lib/contexts/AuthContext';

const publicRoutes = ['/login', '/login-diagnostic', '/setup-admin', '/test-auth', '/verify-setup', '/auto-fix', '/admin/auto-fix', '/auto-fix-complete'];

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  // Public routes: no Layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes: show loading, then Layout
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

## ✅ Current Status

### What's Working:
- ✅ AuthContext loading state properly implemented
- ✅ ProtectedLayout has loading check
- ✅ Middleware cookie persistence configured

### What Needs Fix:
- ⚠️ Protected routes at root level don't get Layout
- ⚠️ Need ConditionalLayout or move routes to (protected) folder

## 🎯 Recommended Action

**Best Solution**: Create `ConditionalLayout` component that:
1. Checks if route is public
2. If public → render children without Layout
3. If protected → show loading, then render with Layout

This way:
- ✅ Public routes (like `/login`) don't get Layout
- ✅ Protected routes get Layout with loading check
- ✅ No need to move files
- ✅ Works with current structure

---

**Status**: ⚠️ Needs ConditionalLayout implementation



