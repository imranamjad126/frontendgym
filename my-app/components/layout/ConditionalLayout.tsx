"use client";

import { usePathname } from "next/navigation";
import { Layout } from "./Layout";
import { useAuth } from "@/lib/contexts/AuthContext";
import type { ReactNode } from "react";

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { session, loading } = useAuth();

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
  // This is CRITICAL - login page must NEVER show Layout
  if (isPublic) {
    return <>{children}</>;
  }

  // Protected routes: Show loading while session is being checked
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  // Protected routes: Only show Layout if session exists
  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-slate-500">Redirecting...</div>
      </div>
    );
  }

  // Protected routes: Only show Layout for /admin, /owner, /staff
  if (pathname.startsWith("/admin") || pathname.startsWith("/owner") || pathname.startsWith("/staff")) {
    return <Layout>{children}</Layout>;
  }

  // Fallback: No Navbar/Sidebar for other routes
  return <>{children}</>;
}
