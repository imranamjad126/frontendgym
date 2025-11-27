"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { AuthProvider, useAuth } from "@/lib/contexts/AuthContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, session } = useAuth();

  const publicRoutes = ["/login", "/register", "/auth/reset"];
  const isPublic = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  // Show loader during auth check (not the full layout)
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

  // Public routes: no navbar/sidebar
  if (isPublic) {
    return <>{children}</>;
  }

  // Protected routes: show navbar + sidebar
  // Only show if session exists (middleware handles redirect if not)
  if (session) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          {children}
        </div>
      </div>
    );
  }

  // If no session and not public, show loader (redirect will happen)
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4"></div>
        <div className="text-slate-500">Redirecting...</div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
