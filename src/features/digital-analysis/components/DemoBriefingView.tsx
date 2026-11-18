"use client";

import React from "react";
import Link from "next/link";
import { useDigitalAnalysis } from "../context";
import { Role } from "../types";
import { ArrowRight, Play, Tv, Users, CheckCircle2, CheckSquare, Fingerprint } from "lucide-react";

export function DemoBriefingView() {
  const { switchRole } = useDigitalAnalysis();

  const handleSelectRoleAndGo = (role: Role) => {
    switchRole(role);
  };

  const criteriaList = [
    {
      id: "A-DEMO-01",
      title: "Dashboard Pimpinan",
      desc: "Agregat 3 kasus (1 review, 1 verif, 1 draft, 0 closed)",
    },
    {
      id: "A-DEMO-02",
      title: "Workspace KAS-101",
      desc: "4 bukti awal, graf interaksi 3 node & 2 relasi berarah",
    },
    {
      id: "A-DEMO-03",
      title: "Kompartemen KAS-102",
      desc: "Analis ditolak (403 FORBIDDEN) tanpa membocorkan materi",
    },
    {
      id: "A-DEMO-04",
      title: "Uji Impor Batch",
      desc: "Invalid ditolak, valid EV-06 idempoten tanpa duplikasi",
    },
    {
      id: "A-DEMO-05",
      title: "Prasyarat Verifikasi",
      desc: "Laporan KAS-101 dicegah sebelum ada verifikasi sah",
    },
    {
      id: "A-DEMO-06",
      title: "Tugas Petugas Verifikasi",
      desc: "U-VF menerima tugas KAS-101, konfirmasi 08.00 WIB tersimpan",
    },
    {
      id: "A-DEMO-07",
      title: "Review & Persetujuan",
      desc: "Pemisahan analis/reviewer, pengembalian revisi & penutupan kasus",
    },
    {
      id: "A-DEMO-08",
      title: "Wallboard Real-time",
      desc: "Sinkronisasi instan via event storage lintas tab browser",
    },
    {
      id: "A-DEMO-09",
      title: "Keamanan Draf Pimpinan",
      desc: "Pimpinan dilarang membuka draf yang belum disetujui",
    },
    {
      id: "A-DEMO-10",
      title: "Reset Fixture Admin",
      desc: "Pemulihan data awal seed dan reset jam demo 09.00 WIB",
    },
    {
      id: "A-DEMO-11",
      title: "Intake Bukti KAS-103",
      desc: "Kasus draft dicegah peninjauan sebelum ada minimal 1 bukti",
    },
    {
      id: "A-DEMO-12",
      title: "Pembuatan Kasus Baru",
      desc: "Analis otomatis terdaftar sebagai author & reviewer U-RV",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Hero Welcome Card */}
      <div className="bg-[#151E36] text-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-[#2A3756] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#F0BC79]/20 via-blue-500/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0BC79]/20 text-[#F0BC79] text-xs font-bold border border-[#F0BC79]/30">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F0BC79] animate-pulse"></span>
              <span>STANDAR OPERASIONAL KODIKLAT TNI · PROTOTIPE v0.1</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>12/12 ACCEPTANCE CRITERIA VERIFIED</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Platform Analisis Akun & Jaringan Digital (P-ANJAD)
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
            Sistem intelijen pertahanan informasi dan klarifikasi terverifikasi. Memperlihatkan
            bagaimana staf Kodiklat menyusun bahan klarifikasi dari bukti yang dapat diperiksa,
            menugaskan verifikasi berizin, dan menyerahkan laporan yang telah ditinjau kepada
            pimpinan.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => handleSelectRoleAndGo("analis")}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#F0BC79] hover:bg-[#e2aa63] text-[#151E36] font-black text-sm shadow-xl hover:shadow-[#F0BC79]/20 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Mulai Skenario Demo (Sebagai Analis)</span>
            </button>
            <Link
              href="/profiling"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-sm border border-cyan-500/40 transition-all"
            >
              <Fingerprint className="w-4 h-4 text-cyan-300" />
              <span>Enjin Deep Profiling Akun</span>
            </Link>
            <Link
              href="/wallboard"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
            >
              <Tv className="w-4 h-4 text-[#F0BC79]" />
              <span>Buka Layar Wallboard 16:9</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 30M High-Value Feature Highlight: Deep Profiling & Anonymous Account Discovery */}
      <div className="bg-gradient-to-r from-[#151E36] via-[#1E2B4D] to-[#151E36] rounded-3xl p-6 sm:p-8 text-white border border-[#2A3756] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0BC79]/20 text-[#F0BC79] text-xs font-bold border border-[#F0BC79]/30">
            <Fingerprint className="w-3.5 h-3.5" />
            <span>MODUL UNGGULAN INTELIJEN 30 MILIAR</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Pencari Akun Anonim & Indikasi Lokasi (Deep Profiling Aktif)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Menelusuri aktor anonim (@akun_contoh_a) melalui 6 pilar intelijen: Jejak
            Sherlock/Maigret, Stylometri dialek Jawa Tengah, Pola Waktu Sirkadian 24x7, Forensik
            EXIF kamera & Triangulasi BTS Krapyak, Gateway Dukcapil NIK, serta Pemetaan Relasi
            Maltego.
          </p>
        </div>
        <Link
          href="/profiling"
          className="px-6 py-3.5 rounded-2xl bg-[#F0BC79] hover:bg-[#e2aa63] text-[#151E36] font-black text-xs sm:text-sm flex items-center gap-2.5 shrink-0 shadow-lg hover:shadow-[#F0BC79]/20 transition-all cursor-pointer"
        >
          <span>Uji Deep Profiling</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Role Selector Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-5 h-5 text-[#F0BC79]" />
            <span>Pilih Identitas Peran Demo (Simulasi Kontrak Otorisasi):</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Dapat diganti sewaktu-waktu dari Header
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Pimpinan Demo (Tingkat Paling Atas / Komando) */}
          <button
            onClick={() => handleSelectRoleAndGo("pimpinan")}
            className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2E4A] hover:border-[#F0BC79]/60 shadow-xs hover:shadow-lg transition-all text-left group flex flex-col justify-between cursor-pointer text-slate-100"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-800/40 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform shadow-xs">
                  PIM
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-[#F0BC79] border border-amber-500/30">
                  Komando Atas
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                Mayjen TNI
              </div>
              <div className="font-bold text-base text-white group-hover:text-[#F0BC79]">
                Pimpinan Demo
              </div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                Buka executive dashboard agregat, telaah snapshot laporan disetujui, dan cetak PDF
                bahan paparan.
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1E2E4A] flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Masuk Sebagai Pimpinan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 2. Reviewer Demo (Perwira Penelaah / Asisten Operasi) */}
          <button
            onClick={() => handleSelectRoleAndGo("reviewer")}
            className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2E4A] hover:border-[#F0BC79]/60 shadow-xs hover:shadow-lg transition-all text-left group flex flex-col justify-between cursor-pointer text-slate-100"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-800/40 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform shadow-xs">
                  RV
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Penelaah
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                Kolonel Inf
              </div>
              <div className="font-bold text-base text-white group-hover:text-[#F0BC79]">
                Reviewer Demo
              </div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                Pemisahan wewenang penyusun. Uji kembalikan revisi, atau setujui laporan & tutup
                kasus.
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1E2E4A] flex items-center justify-between text-xs font-bold text-purple-400">
              <span>Masuk Sebagai Reviewer</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 3. Petugas Verifikasi Demo (Jalur Otoritatif Lapangan) */}
          <button
            onClick={() => handleSelectRoleAndGo("petugas_verifikasi")}
            className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2E4A] hover:border-[#F0BC79]/60 shadow-xs hover:shadow-lg transition-all text-left group flex flex-col justify-between cursor-pointer text-slate-100"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform shadow-xs">
                  VF
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verifikator
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                Mayor Cpm
              </div>
              <div className="font-bold text-base text-white group-hover:text-[#F0BC79]">
                Petugas Verifikasi
              </div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                Terima tugas pemeriksaan lapangan, validasi naskah dinas resmi, dan simpan hasil
                konfirmasi.
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1E2E4A] flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Masuk Sebagai Petugas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 4. Analis Demo (Yang Pertama Masukin Kasus & Bukti) */}
          <button
            onClick={() => handleSelectRoleAndGo("analis")}
            className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2E4A] hover:border-[#F0BC79]/60 shadow-xs hover:shadow-lg transition-all text-left group flex flex-col justify-between cursor-pointer text-slate-100"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950/60 text-blue-300 border border-blue-800/40 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform shadow-xs">
                  AN
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Input Kasus Awal
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                Letkol Kav
              </div>
              <div className="font-bold text-base text-white group-hover:text-[#F0BC79]">
                Analis Demo
              </div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                Peran pertama memasukkan kasus, menarik bukti crawler scraper, memetakan graf, dan
                mengajukan verifikasi.
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1E2E4A] flex items-center justify-between text-xs font-bold text-cyan-400">
              <span>Masuk Sebagai Analis</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 5. Admin Demo (Pusat Data & Simulasi) */}
          <button
            onClick={() => handleSelectRoleAndGo("admin_demo")}
            className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2E4A] hover:border-[#F0BC79]/60 shadow-xs hover:shadow-lg transition-all text-left group flex flex-col justify-between cursor-pointer text-slate-100"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800/40 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform shadow-xs">
                  AD
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Admin Sistem
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                PNS IV/a
              </div>
              <div className="font-bold text-base text-white group-hover:text-[#F0BC79]">
                Admin Demo
              </div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                Pantau kesehatan sumber data, uji impor batch valid/invalid, inspeksi jejak audit &
                reset fixture.
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1E2E4A] flex items-center justify-between text-xs font-bold text-rose-400">
              <span>Masuk Sebagai Admin</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Skenario Demonstrasi Table */}
      <div className="bg-[#111A2E] rounded-3xl border border-[#1E2E4A] p-6 sm:p-8 shadow-xs space-y-5 text-slate-100">
        <h3 className="text-base font-bold text-white">
          Tiga Skenario Kasus Demonstrasi Kodiklat TNI
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-5 bg-[#0D1527] rounded-2xl border border-[#1E2E4A] space-y-2">
            <div className="font-bold text-cyan-300 text-sm">KAS-101 · Edaran Latihan Palsu</div>
            <p className="text-slate-300 leading-relaxed">
              Sebuah unggahan di kanal publik menyebut latihan berubah menjadi pukul 10.30 WIB,
              padahal edaran resmi Kodiklat menetapkan 08.00 WIB.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-slate-400">
              Hasil: Klarifikasi resmi pimpinan yang didukung bukti publik dan rujukan dokumen sah.
            </div>
          </div>

          <div className="p-5 bg-[#0D1527] rounded-2xl border border-[#1E2E4A] space-y-2">
            <div className="font-bold text-white text-sm">KAS-102 · Tautan Pendaftaran Tiruan</div>
            <p className="text-slate-300 leading-relaxed">
              Kasus kompartemen tertutup khusus analis latar. Analis demo reguler akan ditolak (
              <code className="font-mono text-rose-400 font-bold">403 FORBIDDEN</code>) tanpa
              membocorkan materi kasus.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-slate-400">
              Hasil: Pembuktian proteksi akses ketat berbasis otorisasi militer.
            </div>
          </div>

          <div className="p-5 bg-[#0D1527] rounded-2xl border border-[#1E2E4A] space-y-2">
            <div className="font-bold text-white text-sm">KAS-103 · Potongan Video Latihan</div>
            <p className="text-slate-300 leading-relaxed">
              Kasus berstatus <strong>Draft</strong> dengan bukti belum lengkap. Sistem mencegah
              peninjauan dimulai sebelum ada minimal 1 rekaman bukti valid.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-slate-400">
              Hasil: Disiplin mutu intake bahan intelijen digital.
            </div>
          </div>
        </div>
      </div>

      {/* Acceptance Criteria Matrix (12 Items) */}
      <div className="bg-[#111A2E] rounded-3xl border border-[#1E2E4A] p-6 sm:p-8 shadow-xs space-y-4 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A]">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Matriks Uji Penerimaan (Acceptance Criteria A-DEMO-01 s/d A-DEMO-12)</span>
          </h3>
          <span className="text-xs text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/40">
            Lulus Pengujian Otomatis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {criteriaList.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-[#0D1527] rounded-xl border border-[#1E2E4A] text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-cyan-400">{item.id}</span>
                <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lulus
                </span>
              </div>
              <div className="font-bold text-white">{item.title}</div>
              <div className="text-[11px] text-slate-400 leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
