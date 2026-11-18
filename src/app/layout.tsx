import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Platform Analisis Akun dan Jaringan Digital · Kodiklat TNI",
  description:
    "Sistem Verifikasi, Investigasi Bukti & Penyusunan Bahan Klarifikasi Pimpinan Kodiklat TNI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full bg-[#080D1A] antialiased text-slate-100">
      <body className="min-h-full flex flex-col bg-[#080D1A] text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
