"use client";

import { usePathname } from "next/navigation";
import { Layout } from "./Layout";
import type { ReactNode } from "react";

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Public routes that MUST NOT show Navbar / Sidebar
  const publicRoutes = ["/login", "/auth", "/forgot-password"];

  // If pathname is not available yet, default to children only (safe for SSR)
  // This prevents Layout from flashing on login page during hydration
  if (!pathname) {
    return <>{children}</>;
  }

  // Normalize pathname (remove trailing slash, query params, hash)
  const normalizedPath = pathname.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

  // Check if normalized pathname is a public route
  const isPublic = publicRoutes.some(route => {
    const normalizedRoute = route.replace(/\/$/, '');
    return normalizedPath === normalizedRoute || normalizedPath.startsWith(normalizedRoute + "/");
  });

  // Public routes: render children only (NO Navbar/Sidebar)
  // This is CRITICAL - login page must NEVER show Layout
  if (isPublic) {
    return <>{children}</>;
  }

  // Protected routes: Only show Layout for /admin, /owner, /staff
  if (normalizedPath.startsWith("/admin") || normalizedPath.startsWith("/owner") || normalizedPath.startsWith("/staff")) {
    return <Layout>{children}</Layout>;
  }

  // Fallback: No Navbar/Sidebar for other routes
  return <>{children}</>;
}
