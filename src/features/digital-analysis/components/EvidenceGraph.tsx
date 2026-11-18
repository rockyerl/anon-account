"use client";

import React, { useState } from "react";
import { GraphNode, GraphEdge, Evidence } from "../types";
import {
  Network,
  Share2,
  MessageSquare,
  ExternalLink,
  Info,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Fingerprint,
} from "lucide-react";
import { EvidenceViewerModal } from "./EvidenceViewerModal";

interface EvidenceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  evidenceList: Evidence[];
  caseId: string;
  onSelectNodeForProfiling?: (handle: string) => void;
}

export function EvidenceGraph({
  nodes,
  edges,
  evidenceList,
  caseId,
  onSelectNodeForProfiling,
}: EvidenceGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<Evidence | null>(null);

  // Graph controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [edgeFilter, setEdgeFilter] = useState<"all" | "reshare" | "reply">("all");

  if (nodes.length === 0 && edges.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <Network className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Belum ada interaksi terdokumentasi</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Kasus ini belum memiliki hubungan relasi antar-entitas berbasis bukti publik yang
          terverifikasi.
        </p>
      </div>
    );
  }

  // Concentric Clustered Intelligence Layout for up to 25+ nodes
  const getNodePos = (node: GraphNode, index: number, total: number) => {
    // If only 1 node
    if (total === 1) return { x: 500, y: 320 };

    // Center Node (index 0 - Inisiator Unggahan Utama)
    if (index === 0) {
      return { x: 500, y: 320 };
    }

    // Small graph fallback (2 to 4 nodes)
    if (total <= 4) {
      const smallAngles = [
        { x: 500, y: 160 },
        { x: 280, y: 440 },
        { x: 720, y: 440 },
      ];
      return smallAngles[index - 1] || { x: 500, y: 320 };
    }

    // Multi-tier Clustered Layout for 5 to 25+ nodes:
    // Tier 1: Inner ring of primary amplifiers (nodes 1..6)
    // Tier 2: Outer ring of secondary community / news portals (nodes 7..total-1)
    const innerCount = Math.min(6, total - 1);
    const outerCount = total - 1 - innerCount;

    if (index <= innerCount) {
      // Inner ring: 6 nodes at radius rx: 195, ry: 135
      const angle = ((index - 1) / innerCount) * 2 * Math.PI - Math.PI / 2;
      return {
        x: 500 + Math.cos(angle) * 195,
        y: 320 + Math.sin(angle) * 135,
      };
    } else {
      // Outer ring: remaining nodes at radius rx: 390, ry: 250
      const outerIndex = index - 1 - innerCount;
      const angle = (outerIndex / outerCount) * 2 * Math.PI - Math.PI / 2 + Math.PI / outerCount;
      return {
        x: 500 + Math.cos(angle) * 390,
        y: 320 + Math.sin(angle) * 250,
      };
    }
  };

  const filteredEdges = edgeFilter === "all" ? edges : edges.filter((e) => e.kind === edgeFilter);

  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Ribbon */}
      <div className="bg-[#151E36] text-white p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs border border-[#2A3756] shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#F0BC79]/20 text-[#F0BC79]">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span>Visualisasi Topologi Jaringan & Diseminasi Pesan</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                {nodes.length} Node · {edges.length} Relasi
              </span>
            </div>
            <div className="text-slate-400 text-xs mt-0.5">
              Garis berarah merepresentasikan penyebaran informasi yang diverifikasi dokumen publik
              sah
            </div>
          </div>
        </div>

        {/* Controls: Filter & Zoom */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-[#0b101d] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setEdgeFilter("all")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                edgeFilter === "all"
                  ? "bg-[#F0BC79] text-[#151E36] font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua Relasi
            </button>
            <button
              onClick={() => setEdgeFilter("reshare")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                edgeFilter === "reshare"
                  ? "bg-[#F0BC79] text-[#151E36] font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Reshare
            </button>
            <button
              onClick={() => setEdgeFilter("reply")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                edgeFilter === "reply"
                  ? "bg-[#F0BC79] text-[#151E36] font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Balasan
            </button>
          </div>

          <div className="flex items-center bg-[#0b101d] p-1 rounded-xl border border-white/10 text-slate-300">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg"
              title="Reset Skala"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Canvas */}
        <div className="lg:col-span-2 bg-[#0B1120] rounded-3xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden min-h-[480px] flex items-center justify-center">
          {/* Subtle Radar Cyber Background Grid */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>
              TOPOLOGI JARINGAN KASUS {caseId} · ZOOM {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          <svg
            viewBox="0 0 1000 640"
            className="w-full h-auto max-h-[580px] z-10 select-none transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <defs>
              {/* Arrowhead default */}
              <marker
                id="arrowhead-default"
                markerWidth="8"
                markerHeight="6"
                refX="20"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#F0BC79" />
              </marker>
              {/* Arrowhead active */}
              <marker
                id="arrowhead-active"
                markerWidth="10"
                markerHeight="7"
                refX="22"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#FBBF24" />
              </marker>
            </defs>

            {/* Edges */}
            {filteredEdges.map((edge) => {
              const srcNode = nodes.find((n) => n.id === edge.sourceNodeId);
              const tgtNode = nodes.find((n) => n.id === edge.targetNodeId);
              if (!srcNode || !tgtNode) return null;

              const srcPos = getNodePos(srcNode, nodes.indexOf(srcNode), nodes.length);
              const tgtPos = getNodePos(tgtNode, nodes.indexOf(tgtNode), nodes.length);

              const isSelected = selectedEdgeId === edge.id;

              const dx = tgtPos.x - srcPos.x;
              const dy = tgtPos.y - srcPos.y;
              const cx = (srcPos.x + tgtPos.x) / 2 - dy * 0.1;
              const cy = (srcPos.y + tgtPos.y) / 2 + dx * 0.1;

              const pathData = `M ${srcPos.x} ${srcPos.y} Q ${cx} ${cy} ${tgtPos.x} ${tgtPos.y}`;

              return (
                <g
                  key={edge.id}
                  onClick={() => {
                    setSelectedEdgeId(edge.id);
                    setSelectedNodeId(null);
                  }}
                  className="cursor-pointer group"
                >
                  <path d={pathData} stroke="transparent" strokeWidth="20" fill="none" />
                  <path
                    d={pathData}
                    stroke={isSelected ? "#FBBF24" : "rgba(240, 188, 121, 0.45)"}
                    strokeWidth={isSelected ? "3.5" : "1.8"}
                    strokeDasharray={edge.kind === "reply" ? "4 3" : "none"}
                    markerEnd={isSelected ? "url(#arrowhead-active)" : "url(#arrowhead-default)"}
                    fill="none"
                    className="transition-all duration-200 group-hover:stroke-[#FBBF24] group-hover:stroke-[2.5]"
                  />
                  {/* Label Pill on selected edge */}
                  {isSelected && (
                    <g transform={`translate(${cx}, ${cy})`}>
                      <rect
                        x="-40"
                        y="-11"
                        width="80"
                        height="22"
                        rx="11"
                        fill="#F0BC79"
                        stroke="#FBBF24"
                        strokeWidth="1.5"
                        className="shadow-sm"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#0F172A"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {edge.kind === "reshare" ? "↺ Reshare" : "💬 Balasan"}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node, idx) => {
              const pos = getNodePos(node, idx, nodes.length);
              const isSelected = selectedNodeId === node.id;
              const isConnected =
                selectedEdge &&
                (selectedEdge.sourceNodeId === node.id || selectedEdge.targetNodeId === node.id);

              const isRoot = idx === 0;
              const initials =
                node.avatarInitials ||
                node.label
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    setSelectedEdgeId(null);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Pulsing ring on selection or root */}
                  {(isSelected || isConnected) && (
                    <circle r="36" fill="rgba(240, 188, 121, 0.25)" className="animate-pulse" />
                  )}

                  {isRoot && !isSelected && (
                    <circle
                      r="34"
                      fill="rgba(239, 68, 68, 0.15)"
                      stroke="rgba(239, 68, 68, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    r={isSelected || isConnected ? "28" : isRoot ? "26" : "22"}
                    fill={
                      isSelected
                        ? "rgba(240, 188, 121, 0.35)"
                        : isRoot
                          ? "rgba(153, 27, 27, 0.6)"
                          : "rgba(15, 23, 42, 0.9)"
                    }
                    stroke={isSelected || isConnected ? "#F0BC79" : isRoot ? "#F87171" : "#475569"}
                    strokeWidth={isSelected ? "2.5" : "1.8"}
                    className="transition-all duration-200 group-hover:stroke-[#F0BC79]"
                  />

                  {/* Inner badge */}
                  <circle
                    r={isRoot ? "18" : "15"}
                    fill={isSelected ? "#F0BC79" : isRoot ? "#EF4444" : "#1E293B"}
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={isSelected ? "#151E36" : isRoot ? "#FFFFFF" : "#CBD5E1"}
                    fontSize={isRoot ? "10" : "8.5"}
                    fontWeight="black"
                    fontFamily="monospace"
                  >
                    {initials}
                  </text>

                  {/* Node label box below */}
                  <g transform={`translate(0, ${isRoot ? 28 : 25})`}>
                    <rect
                      x="-55"
                      y="0"
                      width="110"
                      height="18"
                      rx="5"
                      fill="#0B1120"
                      stroke={isSelected ? "#F0BC79" : isRoot ? "#F87171" : "#334155"}
                      strokeWidth={isSelected ? "1.5" : "1"}
                      className="shadow-sm"
                    />
                    <text
                      x="0"
                      y="12"
                      textAnchor="middle"
                      fill={isSelected ? "#F0BC79" : isRoot ? "#FCA5A5" : "#F1F5F9"}
                      fontSize="8.5"
                      fontWeight="bold"
                    >
                      {node.label.length > 15 ? node.label.slice(0, 14) + "…" : node.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Side Detail Panel & Navigable List */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between pb-3 border-b border-slate-100">
              <span>Profil Seleksi Intelijen</span>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                Interaktif
              </span>
            </h4>

            {selectedEdge ? (
              <div className="mt-4 space-y-3.5">
                <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-2xl text-xs space-y-2">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    {selectedEdge.kind === "reshare" ? (
                      <Share2 className="w-4 h-4 text-amber-700" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-amber-700" />
                    )}
                    <span>
                      Tipe Relasi:{" "}
                      {selectedEdge.kind === "reshare"
                        ? "Amplifikasi / Reshare"
                        : "Interaksi Balasan / Reply"}
                    </span>
                  </div>
                  <div className="text-slate-700 font-mono text-[11px] bg-white p-2.5 rounded-xl border border-amber-200">
                    <div>
                      Entitas Sumber:{" "}
                      <strong>
                        {nodes.find((n) => n.id === selectedEdge.sourceNodeId)?.label}
                      </strong>
                    </div>
                    <div>
                      Entitas Tujuan:{" "}
                      <strong>
                        {nodes.find((n) => n.id === selectedEdge.targetNodeId)?.label}
                      </strong>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bukti Pendukung Terkait:
                  </div>
                  {selectedEdge.evidenceIds.map((evId) => {
                    const ev = evidenceList.find((e) => e.id === evId);
                    if (!ev) return null;
                    return (
                      <button
                        key={ev.id}
                        onClick={() => setActiveEvidenceModal(ev)}
                        className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-[#151E36] bg-slate-50 hover:bg-white transition-all text-xs group shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#151E36] bg-slate-200 px-2 py-0.5 rounded">
                            {ev.id}
                          </span>
                          <span className="text-[10px] text-blue-700 font-bold group-hover:underline flex items-center gap-1">
                            Periksa Bukti <ExternalLink className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 mt-2">{ev.title}</div>
                        <div className="text-slate-500 text-[11px] mt-1 line-clamp-2 italic">
                          &ldquo;{ev.excerpt}&rdquo;
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : selectedNode ? (
              <div className="mt-4 space-y-3 text-xs">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-white">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#F0BC79] bg-[#151E36] px-2 py-0.5 rounded border border-[#2A3756]">
                      {selectedNode.id}
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      Entitas Teridentifikasi
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-white text-sm">{selectedNode.label}</div>
                    {selectedNode.handle && (
                      <div className="font-mono text-cyan-400 text-xs mt-0.5 font-semibold">
                        {selectedNode.handle}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2 text-[11px] text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Peran Propagasi:</span>
                      <strong className="text-[#F0BC79]">
                        {selectedNode.role ||
                          (selectedNode.id === "N-01" ? "Inisiator Unggahan" : "Amplifikasi Pesan")}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Relasi Terhubung:</span>
                      <strong className="text-white">
                        {
                          edges.filter(
                            (e) =>
                              e.sourceNodeId === selectedNode.id ||
                              e.targetNodeId === selectedNode.id
                          ).length
                        }{" "}
                        Relasi
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Estimasi Seluler / BTS:</span>
                      <strong className="text-cyan-300">
                        {selectedNode.id === "N-01"
                          ? "BTS Krapyak (Semarang)"
                          : selectedNode.id === "N-02"
                            ? "BTS Wonokromo (Surabaya)"
                            : "Sinyal BTS Regional"}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onSelectNodeForProfiling?.(selectedNode.handle || selectedNode.label)
                    }
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-[#F0BC79] hover:bg-[#e2aa63] text-[#151E36] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4 text-[#151E36]" />
                    <span>Buka Deep Profiling Akun Ini</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 italic p-1">
                  Klik tombol di atas untuk melihat dossier OSINT, telemetri perangkat, triangulasi
                  BTS, dan NIK Dukcapil akun ini.
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-slate-400 py-8">
                <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span>
                  Pilih node akun atau garis interaksi di graf untuk menampilkan berkas bukti
                  terhubung.
                </span>
              </div>
            )}
          </div>

          {/* Keyboard Navigable Relations List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Daftar Relasi (Aksesibilitas / Keyboard)
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto" role="list">
              {edges.map((edge) => {
                const src =
                  nodes.find((n) => n.id === edge.sourceNodeId)?.label || edge.sourceNodeId;
                const tgt =
                  nodes.find((n) => n.id === edge.targetNodeId)?.label || edge.targetNodeId;
                const isSelected = selectedEdgeId === edge.id;

                return (
                  <button
                    key={edge.id}
                    onClick={() => {
                      setSelectedEdgeId(edge.id);
                      setSelectedNodeId(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-[#151E36] text-white border-[#151E36] font-semibold shadow-xs"
                        : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[11px]">
                        {src} &rarr; {tgt}
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 ${isSelected ? "text-[#F0BC79]" : "text-slate-500"}`}
                      >
                        {edge.kind === "reshare" ? "Reshare" : "Balasan"} · Bukti:{" "}
                        {edge.evidenceIds.join(", ")}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#F0BC79]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Local Evidence Modal Viewer */}
      <EvidenceViewerModal
        evidence={activeEvidenceModal}
        onClose={() => setActiveEvidenceModal(null)}
      />
    </div>
  );
}
