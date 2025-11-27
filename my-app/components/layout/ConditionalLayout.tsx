"use client";

import Layout from "./Layout";
import { usePathname } from "next/navigation";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();

  // Pages that MUST NOT show Navbar / Sidebar
  const publicRoutes = ["/login", "/auth", "/forgot-password"];

  const isPublic = publicRoutes.includes(pathname);

  if (isPublic) {
    return <>{children}</>;   // NO NAVBAR
  }

  return <Layout>{children}</>;  // ONLY PROTECTED ROUTES
}
