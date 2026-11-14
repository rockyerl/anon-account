import React from "react";
import { requireAuth } from "@/lib/auth/context";
import { getDynamicSidebarNavigation, Sidebar, Header } from "@/features/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Enforce Server-Side Authentication (BE-03, SEC-07)
  const session = await requireAuth();

  // 2. Fetch dynamic sidebar navigation strictly for this user's role
  const dynamicCategories = await getDynamicSidebarNavigation(session);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      {/* Dynamic Sidebar */}
      <Sidebar categories={dynamicCategories} currentUser={session} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentUser={session} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
