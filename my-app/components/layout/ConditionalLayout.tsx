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
