import { describe, it, expect, beforeEach } from "vitest";
import {
  listCases,
  getCase,
  createCase,
  startReview,
  recordEvidence,
  listEvidence,
  getGraph,
  requestVerification,
  listVerificationRequests,
  resolveVerification,
  saveDraftReport,
  submitReport,
  reviewReport,
  getReport,
  simulateImport,
  resetDemo,
  getAggregateMetrics,
  generateDeterministicSummary,
  simulateFastVerification,
} from "@/features/digital-analysis/adapter";
import { DEMO_ACTIONS_CONFIG } from "@/features/digital-analysis/fixtures";

describe("Platform Analisis Akun dan Jaringan Digital - Acceptance Criteria A-DEMO-01 to A-DEMO-11", () => {
  beforeEach(() => {
    // Reset to clean seed before each test
    resetDemo("U-AD");
  });

  it("A-DEMO-01: Buka dashboard seed sebagai pimpinan", () => {
    const metrics = getAggregateMetrics();
    expect(metrics.totalCases).toBe(3);
    expect(metrics.inReview).toBe(1); // KAS-101
    expect(metrics.awaitingVerification).toBe(1); // KAS-102
    expect(metrics.draft).toBe(1); // KAS-103
    expect(metrics.closed).toBe(0);

    const res = listCases("U-PIM");
    expect("cases" in res).toBe(true);
    if ("cases" in res) {
      expect(res.cases.length).toBe(3);
      const statuses = res.cases.map((c) => c.status).sort();
      expect(statuses).toEqual(["awaiting_verification", "draft", "in_review"]);
    }
  });

  it("A-DEMO-02: Buka KAS-101 sebagai analis", () => {
    // Check evidence
    const evRes = listEvidence("U-AN", "KAS-101");
    expect("evidence" in evRes).toBe(true);
    if ("evidence" in evRes) {
      expect(evRes.evidence.length).toBe(4); // EV-01, EV-02, EV-03, EV-04
      const ids = evRes.evidence.map((e) => e.id);
      expect(ids).toContain("EV-01");
      expect(ids).toContain("EV-02");
      expect(ids).toContain("EV-03");
      expect(ids).toContain("EV-04");
    }

    // Check graph
    const graphRes = getGraph("U-AN", "KAS-101");
    expect("nodes" in graphRes).toBe(true);
    if ("nodes" in graphRes) {
      expect(graphRes.nodes.length).toBe(20);
      expect(graphRes.edges.length).toBe(20);
      expect(graphRes.edges[0].evidenceIds).toEqual(["EV-02"]);
      expect(graphRes.edges[1].evidenceIds).toEqual(["EV-03"]);
    }
  });

  it("A-DEMO-03: Cari KAS-102 dan coba URL langsung sebagai analis demo", () => {
    // Search as analyst
    const listRes = listCases("U-AN", { search: "KAS-102" });
    expect("cases" in listRes).toBe(true);
    if ("cases" in listRes) {
      expect(listRes.cases.some((c) => c.id === "KAS-102")).toBe(false);
    }

    // Direct access to KAS-102
    const getRes = getCase("U-AN", "KAS-102");
    expect("error" in getRes).toBe(true);
    if ("error" in getRes) {
      expect(getRes.error).toBe("FORBIDDEN");
    }
  });

  it("A-DEMO-04: Impor batch invalid, impor valid dua kali", () => {
    // 1. Invalid import
    const invalidBatch = DEMO_ACTIONS_CONFIG.invalidImport;
    const invRes = simulateImport("U-AD", invalidBatch);
    expect(invRes.success).toBe(false);
    expect(invRes.addedCount).toBe(0);
    expect(invRes.error).toBe("Kasus tidak dikenal");

    // 2. Valid import 1st time
    const validBatch = DEMO_ACTIONS_CONFIG.validImport;
    const validRes1 = simulateImport("U-AD", validBatch);
    expect(validRes1.success).toBe(true);
    expect(validRes1.addedCount).toBe(1);
    expect(validRes1.duplicateCount).toBe(0);

    // Verify EV-06 is added to KAS-101
    const evCheck1 = listEvidence("U-AN", "KAS-101");
    if ("evidence" in evCheck1) {
      expect(evCheck1.evidence.length).toBe(5);
      expect(evCheck1.evidence.some((e) => e.id === "EV-06")).toBe(true);
    }

    // 3. Valid import 2nd time (idempotent test)
    const validRes2 = simulateImport("U-AD", validBatch);
    expect(validRes2.success).toBe(true);
    expect(validRes2.addedCount).toBe(0);
    expect(validRes2.duplicateCount).toBe(1);

    // Verify EV-06 is NOT duplicated
    const evCheck2 = listEvidence("U-AN", "KAS-101");
    if ("evidence" in evCheck2) {
      expect(evCheck2.evidence.length).toBe(5);
      expect(evCheck2.evidence.filter((e) => e.id === "EV-06").length).toBe(1);
    }
  });

  it("A-DEMO-05: Ajukan laporan KAS-101 sebelum verifikasi", () => {
    // Save draft
    const draft = generateDeterministicSummary("KAS-101", ["EV-01", "EV-04"]);
    saveDraftReport("U-AN", {
      caseId: "KAS-101",
      summary: draft.summary,
      limitations: draft.limitations,
      proposedClarification: draft.proposedClarification,
      evidenceIds: ["EV-01", "EV-04"],
    });

    // Try submit before verification
    const submitRes = submitReport("U-AN", "KAS-101");
    expect("error" in submitRes).toBe(true);
    if ("error" in submitRes) {
      expect(submitRes.error).toBe("VERIFICATION_REQUIRED");
    }

    // Check report status remains draft
    const reportRes = getReport("U-AN", "KAS-101");
    if ("report" in reportRes) {
      expect(reportRes.report.status).toBe("draft");
      expect(reportRes.report.version).toBe(1);
    }
  });

  it("A-DEMO-06: Ajukan permintaan untuk KAS-101, ganti peran ke petugas, simpan hasil fixture", () => {
    // Initially, petugas U-VF queue is empty (V-200 is for background user)
    const initialQueue = listVerificationRequests("U-VF");
    if ("requests" in initialQueue) {
      expect(initialQueue.requests.length).toBe(0);
    }

    // Analyst requests verification for KAS-101
    const reqAction = DEMO_ACTIONS_CONFIG.requestTemplate;
    const reqRes = requestVerification("U-AN", reqAction);
    expect("request" in reqRes).toBe(true);

    // Case status should now be awaiting_verification
    const caseAfterReq = getCase("U-AN", "KAS-101");
    if ("case" in caseAfterReq) {
      expect(caseAfterReq.case.status).toBe("awaiting_verification");
    }

    // Verifier U-VF now sees this request, but does NOT see V-200
    const queueAfterReq = listVerificationRequests("U-VF");
    if ("requests" in queueAfterReq) {
      expect(queueAfterReq.requests.length).toBe(1);
      const req = queueAfterReq.requests[0];
      expect(req.caseId).toBe("KAS-101");
      expect(req.assigneeId).toBe("U-VF");
      expect(queueAfterReq.requests.some((r) => r.id === "V-200")).toBe(false);

      // Verifier saves result
      const resolveRes = resolveVerification("U-VF", {
        requestId: req.id,
        status: "verified",
        outcomeNote: DEMO_ACTIONS_CONFIG.verificationResult.outcomeNote,
      });
      expect("request" in resolveRes).toBe(true);

      // Case returns to in_review
      const caseAfterResolve = getCase("U-AN", "KAS-101");
      if ("case" in caseAfterResolve) {
        expect(caseAfterResolve.case.status).toBe("in_review");
      }
    }
  });

  it("A-DEMO-07: Ajukan draf, reviewer kembalikan, revisi, ajukan kembali, setujui", () => {
    // 1. Complete verification first
    const reqAction = DEMO_ACTIONS_CONFIG.requestTemplate;
    const reqRes = requestVerification("U-AN", reqAction);
    let reqId = "";
    if ("request" in reqRes) {
      reqId = reqRes.request.id;
    }
    resolveVerification("U-VF", {
      requestId: reqId,
      status: "verified",
      outcomeNote: "Jadwal 08.00 WIB terkonfirmasi",
    });

    // 2. Analyst drafts and submits report
    const draft = generateDeterministicSummary("KAS-101", ["EV-01", "EV-04"]);
    saveDraftReport("U-AN", {
      caseId: "KAS-101",
      summary: draft.summary,
      limitations: draft.limitations,
      proposedClarification: draft.proposedClarification,
      evidenceIds: ["EV-01", "EV-04"],
      verificationRequestId: reqId,
    });
    const subRes = submitReport("U-AN", "KAS-101");
    expect("report" in subRes).toBe(true);
    let reportId = "";
    if ("report" in subRes) {
      reportId = subRes.report.id;
      expect(subRes.report.status).toBe("submitted");
    }

    // Separation of duties test: author U-AN cannot approve!
    const authorApprove = reviewReport("U-AN", {
      reportId,
      decision: "approved",
      note: "Self approve",
    });
    expect("error" in authorApprove).toBe(true);

    // 3. Reviewer rejects report with note
    const rejectRes = reviewReport("U-RV", {
      reportId,
      decision: "rejected",
      note: "Perbaiki penjelasan rujukan internal dan batasan temuan",
    });
    expect("report" in rejectRes).toBe(true);
    if ("report" in rejectRes) {
      expect(rejectRes.report.status).toBe("draft");
      expect(rejectRes.report.reviewHistory?.length).toBe(1);
    }

    // 4. Analyst revises and resubmits
    saveDraftReport("U-AN", {
      caseId: "KAS-101",
      summary: draft.summary + " [Revisi keterangan tambahan]",
      limitations: draft.limitations,
      proposedClarification: draft.proposedClarification,
      evidenceIds: ["EV-01", "EV-04"],
      verificationRequestId: reqId,
    });
    submitReport("U-AN", "KAS-101");

    // 5. Reviewer approves
    const approveRes = reviewReport("U-RV", {
      reportId,
      decision: "approved",
      note: "Laporan lengkap dan siap untuk pimpinan",
    });
    expect("report" in approveRes).toBe(true);
    if ("report" in approveRes) {
      expect(approveRes.report.status).toBe("approved");
      expect(approveRes.report.approvedBy).toBe("U-RV");
    }

    // Case is now closed!
    const closedCase = getCase("U-AN", "KAS-101");
    if ("case" in closedCase) {
      expect(closedCase.case.status).toBe("closed");
    }

    // Pimpinan can now open approved report
    const pimReport = getReport("U-PIM", "KAS-101");
    expect("report" in pimReport).toBe(true);
    if ("report" in pimReport) {
      expect(pimReport.report.status).toBe("approved");
      expect(pimReport.permittedEvidence?.length).toBe(2);
    }
  });

  it("A-DEMO-08: Metrik agregat wallboard mencerminkan status", () => {
    const metricsBefore = getAggregateMetrics();
    expect(metricsBefore.closed).toBe(0);

    // Move KAS-101 through to closed
    const reqAction = DEMO_ACTIONS_CONFIG.requestTemplate;
    const reqRes = requestVerification("U-AN", reqAction);
    if ("request" in reqRes) {
      resolveVerification("U-VF", {
        requestId: reqRes.request.id,
        status: "verified",
        outcomeNote: "Tervalidasi",
      });
    }
    const draft = generateDeterministicSummary("KAS-101", ["EV-01", "EV-04"]);
    saveDraftReport("U-AN", {
      caseId: "KAS-101",
      summary: draft.summary,
      limitations: draft.limitations,
      proposedClarification: draft.proposedClarification,
      evidenceIds: ["EV-01", "EV-04"],
    });
    const sub = submitReport("U-AN", "KAS-101");
    if ("report" in sub) {
      reviewReport("U-RV", {
        reportId: sub.report.id,
        decision: "approved",
        note: "Approved",
      });
    }

    const metricsAfter = getAggregateMetrics();
    expect(metricsAfter.closed).toBe(1);
    expect(metricsAfter.inReview).toBe(0);
  });

  it("A-DEMO-09: Coba URL laporan submitted sebagai pimpinan", () => {
    // Complete verification for KAS-101
    const reqRes = requestVerification("U-AN", DEMO_ACTIONS_CONFIG.requestTemplate);
    if ("request" in reqRes) {
      resolveVerification("U-VF", {
        requestId: reqRes.request.id,
        status: "verified",
        outcomeNote: "Tervalidasi",
      });
    }

    // Submit report, but do NOT approve it yet
    const draft = generateDeterministicSummary("KAS-101", ["EV-01"]);
    saveDraftReport("U-AN", {
      caseId: "KAS-101",
      summary: draft.summary,
      limitations: draft.limitations,
      proposedClarification: draft.proposedClarification,
      evidenceIds: ["EV-01"],
    });
    submitReport("U-AN", "KAS-101");

    // Pimpinan attempts to get report
    const pimReport = getReport("U-PIM", "KAS-101");
    expect("error" in pimReport).toBe(true);
    if ("error" in pimReport) {
      expect(pimReport.error).toBe("FORBIDDEN");
      expect(pimReport.message).toContain("belum disetujui");
    }
  });

  it("A-DEMO-10: Reset admin memulihkan 3 kasus seed dan 0 ditutup", () => {
    // Modify state: close KAS-101
    const reqRes = requestVerification("U-AN", DEMO_ACTIONS_CONFIG.requestTemplate);
    if ("request" in reqRes) {
      resolveVerification("U-VF", {
        requestId: reqRes.request.id,
        status: "verified",
        outcomeNote: "Tervalidasi",
      });
    }
    const draft = generateDeterministicSummary("KAS-101", ["EV-01"]);
    saveDraftReport("U-AN", {
      caseId: "KAS-101",
      summary: draft.summary,
      limitations: draft.limitations,
      proposedClarification: draft.proposedClarification,
      evidenceIds: ["EV-01"],
    });
    const sub = submitReport("U-AN", "KAS-101");
    if ("report" in sub) {
      reviewReport("U-RV", {
        reportId: sub.report.id,
        decision: "approved",
        note: "Approved",
      });
    }

    expect(getAggregateMetrics().closed).toBe(1);

    // Perform Admin Reset
    resetDemo("U-AD");

    const metricsReset = getAggregateMetrics();
    expect(metricsReset.totalCases).toBe(3);
    expect(metricsReset.inReview).toBe(1);
    expect(metricsReset.awaitingVerification).toBe(1);
    expect(metricsReset.draft).toBe(1);
    expect(metricsReset.closed).toBe(0);
    expect(metricsReset.demoNow).toBe("2026-11-17T09:00:00+07:00");
  });

  it("A-DEMO-11: Kasus draft KAS-103 tidak bisa dimulai review tanpa bukti", () => {
    const res = startReview("U-AN", "KAS-103");
    expect("error" in res).toBe(true);
    if ("error" in res) {
      expect(res.error).toBe("EVIDENCE_REQUIRED");
      expect(res.message).toContain("Perlu minimal 1 bukti terdata");
    }

    // Add evidence to KAS-103
    const evRes = recordEvidence("U-AN", "KAS-103", {
      sourceId: "SRC-PUB",
      kind: "public_post",
      sourceRef: "https://kanal-demo.example/p/103",
      title: "Video latihan pendek tanpa keterangan",
      excerpt: "Rekaman video durasi 12 detik tanpa penanggalan yang jelas.",
      occurredAt: "2026-11-17T08:00:00+07:00",
    });
    expect("evidence" in evRes).toBe(true);

    // Now startReview should succeed
    const startRes = startReview("U-AN", "KAS-103");
    expect("case" in startRes).toBe(true);
    if ("case" in startRes) {
      expect(startRes.case.status).toBe("in_review");
    }
  });

  it("A-DEMO-12: Analis membuat kasus baru dan otomatis menjadi anggota analis", () => {
    const res = createCase("U-AN", {
      title: "Disinformasi Seleksi Calon Prajurit Baru",
      category: "edaran",
    });
    expect("case" in res).toBe(true);
    if ("case" in res) {
      expect(res.case.status).toBe("draft");
      expect(res.case.analystIds).toContain("U-AN");
    }
  });

  it("A-DEMO-13: Permintaan verifikasi menolak bukti milik kasus lain (Integritas Bukti Hulu-Hilir)", () => {
    // KAS-101 is in_review. Try submitting EV-05 (which belongs to KAS-102) to KAS-101
    const foreignRes = requestVerification("U-AN", {
      caseId: "KAS-101",
      assigneeId: "U-VF",
      question: "Periksa bukti silang kasus",
      evidenceIds: ["EV-05"], // EV-05 is from KAS-102!
    });

    expect("error" in foreignRes).toBe(true);
    if ("error" in foreignRes) {
      expect(foreignRes.error).toBe("VALIDATION_ERROR");
      expect(foreignRes.message).toContain("bukan milik kasus KAS-101");
    }
  });

  it("A-DEMO-14: Ringkasan deterministik laporan menyesuaikan kategori kasus secara kontekstual", () => {
    // Non-KAS-101 case test: KAS-102 (tautan)
    const summary102 = generateDeterministicSummary("KAS-102", ["EV-05"]);
    expect(summary102.summary).toContain("KAS-102");
    expect(summary102.summary).toContain("phishing");
    expect(summary102.proposedClarification).toContain("rekrutmen-tni.mil.id");

    // KAS-101 (edaran) preserves legacy schedule simulation
    const summary101 = generateDeterministicSummary("KAS-101", ["EV-01", "EV-04"]);
    expect(summary101.summary).toContain("jadwal pelaksanaan latihan");
    expect(summary101.proposedClarification).toContain("08.00 WIB");
  });

  it("A-DEMO-15: Profiling target per skenario dan simulasi verifikasi cepat antar kategori", () => {
    // 1. KAS-101 verification simulation
    const v101 = simulateFastVerification("U-AN", "KAS-101");
    expect("request" in v101).toBe(true);
    if ("request" in v101) {
      expect(v101.request.status).toBe("verified");
      expect(v101.request.outcomeNote).toContain("08.00 WIB");
    }

    // 2. KAS-102 verification simulation
    const v102 = simulateFastVerification("U-BACKGROUND-AN", "KAS-102");
    expect("request" in v102).toBe(true);
    if ("request" in v102) {
      expect(v102.request.status).toBe("verified");
      expect(v102.request.outcomeNote).toContain("phishing");
    }
  });
});
