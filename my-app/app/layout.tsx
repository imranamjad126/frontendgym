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
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
