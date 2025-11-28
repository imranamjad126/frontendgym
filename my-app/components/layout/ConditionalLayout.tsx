"use client";

import { Layout } from "./Layout";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Pages that MUST NOT show Navbar / Sidebar
  const publicRoutes = ["/login", "/auth", "/forgot-password"];

  // Check if pathname starts with any public route
  const isPublic = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublic) {
    return <>{children}</>;   // NO NAVBAR
  }

  return <Layout>{children}</Layout>;  // ONLY PROTECTED ROUTES
}
