"use client";

import { Layout } from "./Layout";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import type { ReactNode } from "react";

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { loading, session } = useAuth();

  // Pages that MUST NOT show Navbar / Sidebar
  const publicRoutes = ["/login", "/auth", "/forgot-password"];

  // Check if pathname starts with any public route
  const isPublic = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  // Public routes: render children only (no layout)
  if (isPublic) {
    return <>{children}</>;
  }

  // Protected routes: show loading spinner while session is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4"></div>
          <div className="text-slate-500">Loading...</div>
        </div>
      </div>
    );
  }

  // Protected routes: show full layout only after session is confirmed
  if (session) {
    return <Layout>{children}</Layout>;
  }

  // If no session and not public, show loading (middleware will redirect)
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4"></div>
        <div className="text-slate-500">Redirecting...</div>
      </div>
    </div>
  );
}
