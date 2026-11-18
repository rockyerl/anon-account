"use client";

import React from "react";
import Link from "next/link";
import { ShieldX, ArrowLeft, Lock } from "lucide-react";

export function AccessDenied({
  title = "Akses Ditolak (403 Forbidden)",
  message = "Anda tidak memiliki hak akses atau keanggotaan pada kasus ini. Sesuai kebijakan tata kelola intelijen Kodiklat TNI, materi kasus dirahasiakan dan tidak dapat ditampilkan.",
  backHref = "/kasus",
  backLabel = "Kembali ke Daftar Kasus Berizin",
}: {
  title?: string;
  message?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 shadow-xl text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 border border-red-300 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldX className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-3">
          <Lock className="w-3 h-3" />
          <span>KOMARTEMENISASI & OTORISASI KETAT</span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{message}</p>

        <div className="mt-6 pt-5 border-t border-slate-100 flex justify-center">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#151E36] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
