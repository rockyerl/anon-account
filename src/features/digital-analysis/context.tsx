"use client";

import React, { createContext, useContext, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Role,
  User,
  DemoState,
  DigitalCase,
  Evidence,
  GraphNode,
  GraphEdge,
  VerificationRequest,
  Report,
  AuditEntry,
  Source,
} from "./types";
import {
  loadDemoState,
  listCases,
  getCase,
  createCase,
  startReview,
  recordEvidence,
  listEvidence,
  getGraph,
  requestVerification,
  listVerificationRequests,
  getVerificationRequest,
  resolveVerification,
  saveDraftReport,
  submitReport,
  reviewReport,
  getReport,
  simulateImport,
  clearCasesDemo,
  resetDemo,
  getSources,
  getAuditLogs,
  getAggregateMetrics,
  generateDeterministicSummary,
  simulateFastVerification,
  takeOverCase,
  ensureScenarioCase,
  RecordEvidenceInput,
} from "./adapter";
import { DEMO_ACTIONS_CONFIG, INITIAL_DEMO_STATE } from "./fixtures";

const ACTIVE_ROLE_KEY = "analisis-digital-active-role";

interface DigitalAnalysisContextValue {
  state: DemoState;
  currentUser: User;
  currentRole: Role;
  demoNow: string;
  isReady: boolean;
  switchRole: (role: Role) => void;
  actions: {
    listCases: (filter?: {
      status?: string;
      category?: string;
      search?: string;
    }) => { cases: DigitalCase[] } | { error: string };
    getCase: (caseId: string) => { case: DigitalCase } | { error: string };
    createCase: (input: {
      title: string;
      category: string;
    }) => { case: DigitalCase } | { error: string; message?: string };
    startReview: (caseId: string) => { case: DigitalCase } | { error: string; message?: string };
    recordEvidence: (
      caseId: string,
      input: RecordEvidenceInput
    ) => { evidence: Evidence } | { error: string; message?: string };
    listEvidence: (
      caseId: string,
      filter?: { kind?: string; sourceId?: string; startDate?: string; endDate?: string }
    ) => { evidence: Evidence[] } | { error: string };
    getGraph: (caseId: string) => { nodes: GraphNode[]; edges: GraphEdge[] } | { error: string };
    requestVerification: (input: {
      caseId: string;
      assigneeId: string;
      question: string;
      evidenceIds: string[];
    }) => { request: VerificationRequest } | { error: string; message?: string };
    listVerificationRequests: () => { requests: VerificationRequest[] } | { error: string };
    getVerificationRequest: (
      requestId: string
    ) =>
      | { request: VerificationRequest; caseItem?: DigitalCase; attachedEvidence?: Evidence[] }
      | { error: string };
    resolveVerification: (input: {
      requestId: string;
      status: "verified" | "inconclusive";
      outcomeNote: string;
    }) => { request: VerificationRequest } | { error: string; message?: string };
    saveDraftReport: (input: {
      caseId: string;
      summary: string;
      limitations: string;
      proposedClarification: string;
      evidenceIds: string[];
      verificationRequestId?: string;
    }) => { report: Report } | { error: string; message?: string };
    submitReport: (
      caseId: string,
      draftInput?: {
        summary: string;
        limitations: string;
        proposedClarification: string;
        evidenceIds: string[];
        verificationRequestId?: string;
      }
    ) => { report: Report } | { error: string; message?: string };
    reviewReport: (input: {
      reportId: string;
      decision: "approved" | "rejected";
      note: string;
    }) => { report: Report } | { error: string; message?: string };
    getReport: (
      caseId: string
    ) =>
      | { report: Report; permittedEvidence?: Partial<Evidence>[] }
      | { error: string; message?: string };
    simulateImport: (batch: {
      batchId: string;
      caseId?: string;
      evidence?: Evidence;
      reason?: string;
    }) => {
      success: boolean;
      batchId: string;
      addedCount: number;
      duplicateCount: number;
      message?: string;
      error?: string;
    };
    clearCasesDemo: () => { success: boolean };
    resetDemo: () => { success: boolean };
    getSources: () => Source[];
    getAuditLogs: () => AuditEntry[];
    getAggregateMetrics: () => ReturnType<typeof getAggregateMetrics>;
    generateDeterministicSummary: (
      caseId: string,
      evidenceIds: string[]
    ) => { summary: string; limitations: string; proposedClarification: string };
    simulateFastVerification: (
      caseId: string
    ) => { request: VerificationRequest } | { error: string; message?: string };
    takeOverCase: (caseId: string) => { case: DigitalCase } | { error: string; message?: string };
    ensureScenarioCase: (scenarioId: string) => { success: boolean; case: DigitalCase };
  };
  demoActionsConfig: typeof DEMO_ACTIONS_CONFIG;
}

function subscribeDemoState(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("analisis-digital-demo-update", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("analisis-digital-demo-update", callback);
    window.removeEventListener("storage", callback);
  };
}

function getDemoStateSnapshot(): DemoState {
  return loadDemoState();
}

function getServerDemoStateSnapshot(): DemoState {
  return INITIAL_DEMO_STATE;
}

let cachedRole: Role = "analis";
let lastRoleRaw: string | null = null;

function subscribeRole(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("analisis-digital-role-update", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("analisis-digital-role-update", callback);
    window.removeEventListener("storage", callback);
  };
}

function getRoleSnapshot(): Role {
  if (typeof window === "undefined") return "analis";
  const raw = localStorage.getItem(ACTIVE_ROLE_KEY);
  if (raw === lastRoleRaw) return cachedRole;
  lastRoleRaw = raw;
  if (raw && ["analis", "petugas_verifikasi", "reviewer", "pimpinan", "admin_demo"].includes(raw)) {
    cachedRole = raw as Role;
  } else {
    cachedRole = "analis";
  }
  return cachedRole;
}

function getServerRoleSnapshot(): Role {
  return "analis";
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

const DigitalAnalysisContext = createContext<DigitalAnalysisContextValue | null>(null);

export function DigitalAnalysisProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const state = useSyncExternalStore(
    subscribeDemoState,
    getDemoStateSnapshot,
    getServerDemoStateSnapshot
  );
  const currentRoleId = useSyncExternalStore(subscribeRole, getRoleSnapshot, getServerRoleSnapshot);
  const isReady = useSyncExternalStore(subscribeReady, getReadySnapshot, getServerReadySnapshot);

  const currentUser = state.users.find((u) => u.role === currentRoleId) || state.users[0];

  const switchRole = useCallback(
    (role: Role) => {
      localStorage.setItem(ACTIVE_ROLE_KEY, role);
      window.dispatchEvent(new CustomEvent("analisis-digital-role-update", { detail: role }));

      // Clean detail search parameters & redirect to official screen of the role
      switch (role) {
        case "pimpinan":
          router.push("/dashboard");
          break;
        case "analis":
          router.push("/kasus");
          break;
        case "petugas_verifikasi":
          router.push("/verifikasi");
          break;
        case "reviewer":
          router.push("/kasus");
          break;
        case "admin_demo":
          router.push("/sumber");
          break;
        default:
          router.push("/dashboard");
      }
    },
    [router]
  );

  const actions = {
    listCases: (filter?: { status?: string; category?: string; search?: string }) =>
      listCases(currentUser.id, filter),
    getCase: (caseId: string) => getCase(currentUser.id, caseId),
    createCase: (input: { title: string; category: string }) => createCase(currentUser.id, input),
    startReview: (caseId: string) => startReview(currentUser.id, caseId),
    recordEvidence: (caseId: string, input: RecordEvidenceInput) =>
      recordEvidence(currentUser.id, caseId, input),
    listEvidence: (
      caseId: string,
      filter?: { kind?: string; sourceId?: string; startDate?: string; endDate?: string }
    ) => listEvidence(currentUser.id, caseId, filter),
    getGraph: (caseId: string) => getGraph(currentUser.id, caseId),
    requestVerification: (input: {
      caseId: string;
      assigneeId: string;
      question: string;
      evidenceIds: string[];
    }) => requestVerification(currentUser.id, input),
    listVerificationRequests: () => listVerificationRequests(currentUser.id),
    getVerificationRequest: (requestId: string) =>
      getVerificationRequest(currentUser.id, requestId),
    resolveVerification: (input: {
      requestId: string;
      status: "verified" | "inconclusive";
      outcomeNote: string;
    }) => resolveVerification(currentUser.id, input),
    saveDraftReport: (input: {
      caseId: string;
      summary: string;
      limitations: string;
      proposedClarification: string;
      evidenceIds: string[];
      verificationRequestId?: string;
    }) => saveDraftReport(currentUser.id, input),
    submitReport: (
      caseId: string,
      draftInput?: {
        summary: string;
        limitations: string;
        proposedClarification: string;
        evidenceIds: string[];
        verificationRequestId?: string;
      }
    ) => submitReport(currentUser.id, caseId, draftInput),
    reviewReport: (input: { reportId: string; decision: "approved" | "rejected"; note: string }) =>
      reviewReport(currentUser.id, input),
    getReport: (caseId: string) => getReport(currentUser.id, caseId),
    simulateImport: (batch: {
      batchId: string;
      caseId?: string;
      evidence?: Evidence;
      reason?: string;
    }) => simulateImport(currentUser.id, batch),
    clearCasesDemo: () => clearCasesDemo("U-AD"),
    resetDemo: () => resetDemo("U-AD"),
    getSources: () => getSources(),
    getAuditLogs: () => getAuditLogs(),
    getAggregateMetrics: () => getAggregateMetrics(),
    generateDeterministicSummary: (caseId: string, evidenceIds: string[]) =>
      generateDeterministicSummary(caseId, evidenceIds),
    simulateFastVerification: (caseId: string) => simulateFastVerification(currentUser.id, caseId),
    takeOverCase: (caseId: string) => takeOverCase(currentUser.id, caseId),
    ensureScenarioCase: (scenarioId: string) => ensureScenarioCase(currentUser.id, scenarioId),
  };

  return (
    <DigitalAnalysisContext.Provider
      value={{
        state,
        currentUser,
        currentRole: currentRoleId,
        demoNow: state.demoNow,
        isReady,
        switchRole,
        actions,
        demoActionsConfig: DEMO_ACTIONS_CONFIG,
      }}
    >
      {children}
    </DigitalAnalysisContext.Provider>
  );
}

export function useDigitalAnalysis() {
  const context = useContext(DigitalAnalysisContext);
  if (!context) {
    throw new Error("useDigitalAnalysis must be used within a DigitalAnalysisProvider");
  }
  return context;
}
