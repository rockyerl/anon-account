"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDigitalAnalysis } from "../context";
import { Role } from "../types";
import {
  ShieldAlert,
  FileSearch,
  CheckCircle2,
  Tv,
  Database,
  History,
  Layers,
  ChevronDown,
  Info,
  RotateCcw,
  Shield,
  Fingerprint,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const ROLE_LABELS: Record<
  Role,
  { name: string; title: string; rank: string; badgeColor: string; avatarColor: string }
> = {
  pimpinan: {
    name: "Pimpinan Demo",
    title: "Komandan Kodiklat TNI",
    rank: "Mayjen TNI",
    badgeColor: "bg-amber-500/20 text-amber-700 border-amber-300",
    avatarColor: "from-amber-500 to-amber-700",
  },
  reviewer: {
    name: "Reviewer Demo",
    title: "Perwira Penelaah / Asisten Operasi",
    rank: "Kolonel Inf",
    badgeColor: "bg-purple-500/20 text-purple-700 border-purple-300",
    avatarColor: "from-purple-600 to-violet-900",
  },
  petugas_verifikasi: {
    name: "Petugas Verifikasi Demo",
    title: "Petugas Verifikasi Lapangan & Dokumen",
    rank: "Mayor Cpm",
    badgeColor: "bg-emerald-500/20 text-emerald-700 border-emerald-300",
    avatarColor: "from-emerald-600 to-teal-800",
  },
  analis: {
    name: "Analis Demo",
    title: "Analis Intelijen Digital (Pencatat Kasus)",
    rank: "Letkol Kav",
    badgeColor: "bg-blue-500/20 text-blue-700 border-blue-300",
    avatarColor: "from-blue-600 to-indigo-800",
  },
  admin_demo: {
    name: "Admin Demo",
    title: "Administrator Pusat Data & Simulasi",
    rank: "PNS IV/a",
    badgeColor: "bg-rose-500/20 text-rose-700 border-rose-300",
    avatarColor: "from-rose-600 to-pink-900",
  },
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
  badge?: number;
}

interface NavSection {
  category: string;
  items: NavItem[];
}

function subscribeReady() {
  return () => {};
}
function getReadySnapshot(): boolean {
  return true;
}
function getServerReadySnapshot(): boolean {
  return false;
}

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const { currentRole, demoNow, switchRole, actions } = useDigitalAnalysis();
  const isMounted = useSyncExternalStore(subscribeReady, getReadySnapshot, getServerReadySnapshot);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const activeRole: Role = isMounted ? currentRole : "pimpinan";
  const vReqRes = isMounted ? actions.listVerificationRequests() : { requests: [] };
  const pendingVerificationCount =
    "requests" in vReqRes ? vReqRes.requests.filter((r) => r.status === "pending").length : 0;

  // Format multi-timezone clocks
  const formatTime = (iso: string, timeZone: string, suffix: string) => {
    try {
      const d = new Date(iso);
      return (
        d.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone,
        }) +
        " " +
        suffix
      );
    } catch {
      return iso;
    }
  };

  // Structured Sundawa Navigation Groups based on Operational Workflow
  const navSections: NavSection[] = [
    {
      category: "PENGAWASAN & KOMANDO",
      items: [
        {
          href: "/dashboard",
          label: "Executive Dashboard",
          icon: Layers,
          roles: ["pimpinan", "analis", "reviewer", "admin_demo"],
        },
        {
          href: "/wallboard",
          label: "Puskodal Wallboard 16:9",
          icon: Tv,
          roles: ["pimpinan", "analis", "reviewer", "admin_demo", "petugas_verifikasi"],
        },
      ],
    },
    {
      category: "INTELIJEN SIBER (UPSTREAM)",
      items: [
        {
          href: "/profiling",
          label: "Deep Profiling Akun",
          icon: Fingerprint,
          roles: ["analis", "reviewer", "pimpinan", "admin_demo"],
        },
      ],
    },
    {
      category: "TATA KELOLA KASUS",
      items: [
        {
          href: "/kasus",
          label: "Ruang Kasus Digital",
          icon: FileSearch,
          roles: ["analis", "reviewer", "pimpinan"],
        },
        {
          href: "/verifikasi",
          label: "Antrean Verifikasi",
          icon: CheckCircle2,
          badge:
            activeRole === "petugas_verifikasi" && pendingVerificationCount > 0
              ? pendingVerificationCount
              : undefined,
          roles: ["petugas_verifikasi", "analis", "reviewer"],
        },
      ],
    },
    {
      category: "ADMINISTRASI & INTEGRITAS",
      items: [
        {
          href: "/sumber",
          label: "Sumber Data & Impor",
          icon: Database,
          roles: ["admin_demo"],
        },
        {
          href: "/audit",
          label: "Jejak Audit Forensik",
          icon: History,
          roles: ["admin_demo"],
        },
      ],
    },
    {
      category: "DOKUMENTASI SKENARIO",
      items: [
        {
          href: "/",
          label: "Panduan Pitch 30M",
          icon: Info,
          roles: ["pimpinan", "analis", "reviewer", "admin_demo", "petugas_verifikasi"],
        },
      ],
    },
  ];

  // Find current active section title for breadcrumb
  let currentTitle = "Platform Analisis Akun & Jaringan Digital";
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.href === "/" && pathname === "/") {
        currentTitle = item.label;
      } else if (item.href !== "/" && pathname.startsWith(item.href)) {
        currentTitle = item.label;
      }
    }
  }

  const roleConfig = ROLE_LABELS[activeRole];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0D1527] text-slate-200 border-r border-[#1E293B]">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-18 px-5 border-b border-[#1E293B] bg-[#090E1B]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0BC79] via-[#E2A658] to-[#996515] p-0.5 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0D1527] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#F0BC79]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">P-ANJAD</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-[#F0BC79] border border-amber-500/30">
                PROTOTIPE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide">
              KODIKLAT TNI · INTELIJEN
            </div>
          </div>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups (Flow-based) */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(activeRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.category} className="space-y-1">
              <h4 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {section.category}
              </h4>
              <nav className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive =
                    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? "bg-[#F0BC79] text-[#0D1527] shadow-sm shadow-[#F0BC79]/20 font-bold"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-transform group-hover:scale-110 shrink-0 ${
                            isActive
                              ? "text-[#0D1527]"
                              : "text-slate-400 group-hover:text-slate-200"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-black animate-pulse shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* User Role Card & Switcher at bottom */}
      <div className="p-3 border-t border-[#1E293B] bg-[#090E1B]/80 relative">
        <button
          onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-[#F0BC79] text-left transition group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${roleConfig.avatarColor} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-inner`}
            >
              {activeRole.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-[#F0BC79] font-mono leading-none truncate">
                {roleConfig.rank}
              </div>
              <div className="text-xs font-bold text-white truncate mt-0.5">{roleConfig.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{roleConfig.title}</div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0 ml-1 transition" />
        </button>

        {/* Role Selector Dropdown Modal */}
        {roleDropdownOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#151E36] border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-white text-xs divide-y divide-white/10 animate-in fade-in-50 zoom-in-95">
            <div className="px-4 py-2">
              <div className="font-bold text-[#F0BC79]">Ganti Peran Demonstrasi (RBAC)</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Pilih peran untuk menguji batasan hak akses sesuai standar Kodiklat TNI:
              </div>
            </div>

            <div className="py-1">
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => {
                const isSelected = r === activeRole;
                const cfg = ROLE_LABELS[r];
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      switchRole(r);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-white/10 transition ${
                      isSelected ? "bg-white/15 font-bold text-[#F0BC79]" : "text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cfg.avatarColor} flex items-center justify-center text-white font-bold text-[10px]`}
                      >
                        {r.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {cfg.rank} {cfg.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{cfg.title}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-mono ${cfg.badgeColor}`}
                    >
                      {r}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeRole === "admin_demo" && (
              <div className="p-2.5">
                <button
                  onClick={() => {
                    setRoleDropdownOpen(false);
                    setResetModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 rounded-xl font-bold text-xs transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                  <span>Reset Fixture Seed Awal</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#080D1A] text-slate-100">
      {/* Desktop Sidebar (Sundawa Standard w-72) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 shrink-0">{sidebarContent}</aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full">{sidebarContent}</div>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#080D1A]">
        {/* Top Header Bar (Cohesive Dark Military Command Bar) */}
        <header className="h-16 bg-[#0B1224] border-b border-[#1E293B] px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Section Indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-400 hidden sm:inline">KODIKLAT TNI</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
              <h2 className="font-bold text-white text-sm tracking-tight">{currentTitle}</h2>
            </div>
          </div>

          {/* Right Header Status Telemetry & Clocks */}
          <div className="flex items-center gap-4">
            {/* Clocks */}
            <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-300 bg-[#121B30] px-3.5 py-1.5 rounded-xl border border-[#1E293B]">
              <span className="font-bold text-[#F0BC79]" suppressHydrationWarning>
                {formatTime(demoNow, "Asia/Jakarta", "WIB")}
              </span>
              <span className="text-slate-600">·</span>
              <span suppressHydrationWarning className="text-slate-400">
                {formatTime(demoNow, "Asia/Makassar", "WITA")}
              </span>
              <span className="text-slate-600">·</span>
              <span suppressHydrationWarning className="text-slate-400">
                {formatTime(demoNow, "Asia/Jayapura", "WIT")}
              </span>
            </div>

            {/* Status Pill */}
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">STATUS:</span> SIAGA I
            </span>

            {/* Active User Rank Badge */}
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-[#1E293B]">
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${roleConfig.avatarColor} flex items-center justify-center text-white font-black text-[10px] shadow-xs`}
              >
                {activeRole.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-right text-xs">
                <div className="font-bold text-white leading-none">{roleConfig.rank}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{roleConfig.name}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080D1A]">
          <div className="max-w-7xl mx-auto">
            {isMounted ? (
              children
            ) : (
              <div className="space-y-6 animate-pulse">
                <div className="h-44 bg-[#111A2E] border border-[#1E2E4A] rounded-2xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="h-28 bg-[#111A2E] border border-[#1E2E4A] rounded-2xl" />
                  <div className="h-28 bg-[#111A2E] border border-[#1E2E4A] rounded-2xl" />
                  <div className="h-28 bg-[#111A2E] border border-[#1E2E4A] rounded-2xl" />
                  <div className="h-28 bg-[#111A2E] border border-[#1E2E4A] rounded-2xl" />
                </div>
                <div className="h-96 bg-[#111A2E] border border-[#1E2E4A] rounded-2xl" />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151E36] text-white border border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span>Konfirmasi Pemulihan Seed Fixture Demo</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini akan mengembalikan data kasus, bukti, graf, dan permintaan verifikasi ke
              kondisi awal seed (KAS-101 in_review, KAS-102 awaiting_verification, KAS-103 draft, 0
              closed) serta mereset jam simulasi kembali ke pukul 09.00 WIB.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  actions.resetDemo();
                  setResetModalOpen(false);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Ya, Pulihkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
