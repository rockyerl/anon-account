import React from "react";
import type { SessionPayload } from "@/lib/auth/session";
import { Badge } from "@/shared";
import { ShieldCheck, Database } from "lucide-react";

interface HeaderProps {
  currentUser: SessionPayload;
}

export function Header({ currentUser }: HeaderProps) {
  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="pl-10 lg:pl-0">
        <h1 className="text-base font-semibold text-slate-900 tracking-tight">
          Sistem Pengelolaan Proyek & Akun
        </h1>
        <p className="text-xs text-slate-500 hidden sm:block">
          SUNDAWA Next.js Enterprise Fullstack Architecture
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-mono">
          <Database className="w-3.5 h-3.5 text-indigo-500" />
          <span>Drizzle ORM</span>
        </div>

        <Badge variant="purple" className="py-1 px-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{currentUser.roleName}</span>
        </Badge>
      </div>
    </header>
  );
}
