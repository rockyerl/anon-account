import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUNDAWA - Fullstack Next.js Template Starter",
  description:
    "Standardized Next.js Fullstack Architecture with Auth, Dynamic RBAC, User & Role Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
