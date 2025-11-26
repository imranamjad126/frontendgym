import type { Metadata } from "next";
import "./globals.css";
import { Layout } from "@/components/layout/Layout";

export const metadata: Metadata = {
  title: "Gym Membership Management",
  description: "Premium gym membership management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
