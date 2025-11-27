"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/lib/contexts/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const publicRoutes = ["/login", "/register", "/auth/reset"];
  const isPublic = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          {!isPublic && (
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Navbar />
                {children}
              </div>
            </div>
          )}

          {isPublic && <>{children}</>}
        </AuthProvider>
      </body>
    </html>
  );
}
