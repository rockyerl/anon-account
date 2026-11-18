"use client";

import React, { useState } from "react";
import { Radio, Info } from "lucide-react";

interface TacticalMapProps {
  regionalCounts: {
    Barat: number;
    Tengah: number;
    Timur: number;
    Unknown: number;
  };
}

export function TacticalIndonesianMap({ regionalCounts }: TacticalMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<"Barat" | "Tengah" | "Timur" | null>(null);

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#F0BC79] animate-pulse" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Peta Taktis Sebaran Disinformasi Nasional
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Barat ({regionalCounts.Barat}
            )
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Tengah (
            {regionalCounts.Tengah})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Timur (
            {regionalCounts.Timur})
          </span>
        </div>
      </div>

      {/* Tactical Vector Map Canvas */}
      <div className="relative z-10 py-3 my-auto">
        <svg viewBox="0 0 900 380" className="w-full h-auto select-none">
          {/* Subtle Region Boundaries Backgrounds */}
          {/* Barat (Sumatera & Kalbar & Jabar) */}
          <rect
            x="30"
            y="20"
            width="270"
            height="340"
            rx="16"
            fill={selectedRegion === "Barat" ? "rgba(59, 130, 246, 0.15)" : "rgba(30, 41, 59, 0.3)"}
            stroke={selectedRegion === "Barat" ? "#3B82F6" : "#1E293B"}
            strokeDasharray="4 4"
            className="cursor-pointer transition-all"
            onClick={() => setSelectedRegion(selectedRegion === "Barat" ? null : "Barat")}
          />
          <text x="50" y="45" fill="#60A5FA" fontSize="11" fontWeight="bold" fontFamily="monospace">
            WILAYAH BARAT (KOGABWILHAN I)
          </text>

          {/* Tengah (Jateng, Jatim, Kalsel, Kaltim, Sulsel, Bali) */}
          <rect
            x="315"
            y="20"
            width="290"
            height="340"
            rx="16"
            fill={
              selectedRegion === "Tengah" ? "rgba(245, 158, 11, 0.15)" : "rgba(30, 41, 59, 0.3)"
            }
            stroke={selectedRegion === "Tengah" ? "#F59E0B" : "#1E293B"}
            strokeDasharray="4 4"
            className="cursor-pointer transition-all"
            onClick={() => setSelectedRegion(selectedRegion === "Tengah" ? null : "Tengah")}
          />
          <text
            x="335"
            y="45"
            fill="#FBBF24"
            fontSize="11"
            fontWeight="bold"
            fontFamily="monospace"
          >
            WILAYAH TENGAH (KOGABWILHAN II)
          </text>

          {/* Timur (Maluku, Papua) */}
          <rect
            x="620"
            y="20"
            width="250"
            height="340"
            rx="16"
            fill={selectedRegion === "Timur" ? "rgba(16, 185, 129, 0.15)" : "rgba(30, 41, 59, 0.3)"}
            stroke={selectedRegion === "Timur" ? "#10B981" : "#1E293B"}
            strokeDasharray="4 4"
            className="cursor-pointer transition-all"
            onClick={() => setSelectedRegion(selectedRegion === "Timur" ? null : "Timur")}
          />
          <text
            x="640"
            y="45"
            fill="#34D399"
            fontSize="11"
            fontWeight="bold"
            fontFamily="monospace"
          >
            WILAYAH TIMUR (KOGABWILHAN III)
          </text>

          {/* Stylized Indonesian Island Silhouettes (SVG Paths) */}
          {/* Sumatera */}
          <path
            d="M 60 70 L 110 110 L 160 170 L 220 260 L 210 280 L 160 220 L 100 140 L 50 80 Z"
            fill="#334155"
            stroke="#475569"
            strokeWidth="1.5"
            className="hover:fill-blue-600/50 cursor-pointer transition-colors"
          />
          <text x="110" y="160" fill="#94A3B8" fontSize="10" fontWeight="bold">
            Sumatera
          </text>

          {/* Jawa */}
          <path
            d="M 220 285 L 290 288 L 370 292 L 440 300 L 435 315 L 360 308 L 270 302 L 215 295 Z"
            fill="#334155"
            stroke="#475569"
            strokeWidth="1.5"
            className="hover:fill-amber-600/50 cursor-pointer transition-colors"
          />
          <text x="290" y="318" fill="#94A3B8" fontSize="10" fontWeight="bold">
            Jawa
          </text>

          {/* Kalimantan */}
          <path
            d="M 270 120 L 340 105 L 390 140 L 395 210 L 330 230 L 275 190 L 260 140 Z"
            fill="#334155"
            stroke="#475569"
            strokeWidth="1.5"
            className="hover:fill-blue-600/50 cursor-pointer transition-colors"
          />
          <text x="310" y="170" fill="#94A3B8" fontSize="10" fontWeight="bold">
            Kalimantan
          </text>

          {/* Sulawesi */}
          <path
            d="M 430 140 L 460 145 L 450 180 L 490 175 L 495 195 L 460 200 L 475 250 L 455 255 L 435 215 L 420 170 Z"
            fill="#334155"
            stroke="#475569"
            strokeWidth="1.5"
            className="hover:fill-amber-600/50 cursor-pointer transition-colors"
          />
          <text x="470" y="225" fill="#94A3B8" fontSize="10" fontWeight="bold">
            Sulawesi
          </text>

          {/* Maluku */}
          <ellipse
            cx="560"
            cy="180"
            rx="20"
            ry="35"
            fill="#334155"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <text x="545" y="185" fill="#94A3B8" fontSize="9" fontWeight="bold">
            Maluku
          </text>

          {/* Papua */}
          <path
            d="M 660 150 L 730 145 L 820 180 L 830 250 L 740 260 L 685 220 L 650 170 Z"
            fill="#334155"
            stroke="#475569"
            strokeWidth="1.5"
            className="hover:fill-emerald-600/50 cursor-pointer transition-colors"
          />
          <text x="730" y="205" fill="#94A3B8" fontSize="10" fontWeight="bold">
            Papua
          </text>

          {/* Tactical Pulse Pins for Case Evidence */}
          {/* KAS-101 Barat Pin (EV-02) */}
          <g transform="translate(190, 230)" className="cursor-pointer">
            <circle r="16" fill="rgba(59, 130, 246, 0.25)" className="animate-ping" />
            <circle r="8" fill="#3B82F6" stroke="#93C5FD" strokeWidth="2" />
            <text
              x="14"
              y="4"
              fill="#93C5FD"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              EV-02 (KAS-101)
            </text>
          </g>

          {/* KAS-101 Tengah Pin (EV-01) */}
          <g transform="translate(360, 290)" className="cursor-pointer">
            <circle r="18" fill="rgba(245, 158, 11, 0.3)" className="animate-ping" />
            <circle r="9" fill="#F59E0B" stroke="#FDE68A" strokeWidth="2" />
            <text
              x="14"
              y="4"
              fill="#FDE68A"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              EV-01 (KAS-101)
            </text>
          </g>

          {/* KAS-102 Timur Pin (EV-05) */}
          <g transform="translate(720, 190)" className="cursor-pointer">
            <circle r="18" fill="rgba(16, 185, 129, 0.3)" className="animate-ping" />
            <circle r="9" fill="#10B981" stroke="#A7F3D0" strokeWidth="2" />
            <text
              x="14"
              y="4"
              fill="#A7F3D0"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              EV-05 (KAS-102)
            </text>
          </g>
        </svg>
      </div>

      {/* Footer Info Callout */}
      <div className="relative z-10 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#F0BC79]" />
          <span>
            Sesuai klausul P1: Pemetaan agregat tanpa koordinat atau identitas perseorangan
          </span>
        </span>
        <span className="font-mono text-slate-500">Sistem Koordinat Taktis TNI v1.0</span>
      </div>
    </div>
  );
}
