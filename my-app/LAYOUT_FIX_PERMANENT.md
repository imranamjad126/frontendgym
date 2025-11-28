# ✅ PERMANENT LAYOUT FIX - DO NOT OVERWRITE

## 🔒 Fixed Structure (DO NOT CHANGE)

### 1. ConditionalLayout.tsx
**EXACT CODE - DO NOT MODIFY:**
```typescript
"use client";

import { usePathname } from "next/navigation";
import { Layout } from "./Layout";
import type { ReactNode } from "react";

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Public routes that MUST NOT show Navbar / Sidebar
  const publicRoutes = ["/login", "/auth", "/forgot-password"];

  // Check if pathname is exactly a public route
  const isPublic = publicRoutes.includes(pathname);

  // Public routes: render children only (NO Navbar/Sidebar)
  if (isPublic) {
    return <>{children}</>;
  }

  // Protected routes: Only show Layout for /admin, /owner, /staff
  if (pathname.startsWith("/admin") || pathname.startsWith("/owner") || pathname.startsWith("/staff")) {
    return <Layout>{children}</Layout>;
  }

  // Fallback: No Navbar/Sidebar for other routes
  return <>{children}</>;
}
```

**Key Points:**
- ✅ NO loading/session checks in ConditionalLayout
- ✅ Simple route-based logic only
- ✅ Layout ONLY for `/admin`, `/owner`, `/staff` routes
- ✅ Public routes (`/login`, `/auth`, `/forgot-password`) = NO Layout

---

### 2. app/layout.tsx
**EXACT CODE - DO NOT MODIFY:**
```typescript
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import type { ReactNode } from "react";

export const metadata = {
  title: "Gym Manager",
};

export default function RootLayout({ children }: { children: ReactNode }) {
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

**Key Points:**
- ✅ Server Component (NO "use client")
- ✅ Only wraps with ConditionalLayout
- ✅ NO direct Navbar/Sidebar imports
- ✅ NO usePathname, useState, useEffect

---

### 3. middleware.ts
**Current Status:**
- ✅ Detects Supabase auth cookies (`sb-*-auth-token*`)
- ✅ Excludes public routes: `/login`, `/auth`, `/forgot-password`
- ✅ Excludes static files: `/_next`, `/favicon.ico`, `/public/*`
- ✅ Redirects logged-in users from `/login` to role-based dashboard
- ✅ Redirects non-authenticated users to `/login`

**DO NOT ADD:**
- ❌ Loading checks in middleware
- ❌ Session checks in middleware (only cookie check + Supabase getSession)

---

### 4. Layout.tsx
**Current Status:**
- ✅ Renders Sidebar + Header + Footer + children
- ✅ NO loading/session checks (ConditionalLayout handles that)
- ✅ Simple layout structure only

---

## 🚫 DO NOT DO THESE:

1. ❌ **DO NOT** add `useAuth()` or loading checks in ConditionalLayout
2. ❌ **DO NOT** add Navbar/Sidebar directly in app/layout.tsx
3. ❌ **DO NOT** add "use client" to app/layout.tsx
4. ❌ **DO NOT** add loading spinners in ConditionalLayout
5. ❌ **DO NOT** check session in ConditionalLayout
6. ❌ **DO NOT** wrap Layout with additional checks

---

## ✅ CORRECT BEHAVIOR:

### Public Routes (`/login`, `/auth`, `/forgot-password`):
- ✅ Render ONLY page content
- ✅ NO Navbar
- ✅ NO Sidebar
- ✅ NO Header
- ✅ Clean, minimal layout

### Protected Routes (`/admin`, `/owner`, `/staff`):
- ✅ Render full Layout (Sidebar + Header + Footer)
- ✅ Page content in main area
- ✅ User info in Header
- ✅ Navigation in Sidebar

### Other Routes (`/dashboard`, `/members`, etc.):
- ✅ Render ONLY page content (no Layout)
- ✅ NO Navbar/Sidebar (unless explicitly needed)

---

## 🔧 Testing Checklist:

1. ✅ `/login` → NO Navbar/Sidebar visible
2. ✅ `/admin` → Full Layout (Navbar + Sidebar) visible
3. ✅ `/owner` → Full Layout (Navbar + Sidebar) visible
4. ✅ `/staff` → Full Layout (Navbar + Sidebar) visible
5. ✅ `/dashboard` → NO Layout (if not protected route)
6. ✅ Build successful
7. ✅ No TypeScript errors
8. ✅ No linter errors

---

## 📝 Commit Message Template:

If you need to modify layout, use this format:
```
LAYOUT: [Description] - DO NOT BREAK ConditionalLayout structure
```

---

## 🎯 Key Principle:

**ConditionalLayout = Simple Route Checker**
- It ONLY decides: Layout or No Layout
- It does NOT handle authentication
- It does NOT handle loading states
- Middleware handles authentication
- AuthContext handles session state

---

**Last Updated:** 2025-01-XX
**Status:** ✅ PERMANENT FIX - DO NOT OVERWRITE

