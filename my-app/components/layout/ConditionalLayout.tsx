"use client";

import { usePathname } from "next/navigation";
import { Layout } from "./Layout";
import type { ReactNode } from "react";

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Public routes that MUST NOT show Navbar / Sidebar
  const publicRoutes = ["/login", "/auth", "/forgot-password"];

  // If pathname is not available yet, default to children only (safe for SSR)
  if (!pathname) {
    return <>{children}</>;
  }

  // Check if pathname is a public route (exact match or starts with)
  const isPublic = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

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
