export type Role = "pimpinan" | "reviewer" | "petugas_verifikasi" | "analis" | "admin_demo";
export type CaseStatus = "draft" | "in_review" | "awaiting_verification" | "closed";
export type ReportStatus = "draft" | "submitted" | "approved";
export type VerificationStatus = "pending" | "verified" | "inconclusive";
export type EvidenceKind = "public_post" | "internal_document";
export type InteractionType = "reshare" | "reply";

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Source {
  id: string;
  kind: "public" | "import" | "verification";
  label: string;
  lastSuccessAt: string | null;
}

export interface DigitalCase {
  id: string;
  title: string;
  category: string;
  status: CaseStatus;
  analystIds: string[];
  reviewerIds: string[];
  verificationPolicy: "required" | "not_required";
  updatedAt: string;
}

export interface Evidence {
  id: string;
  caseId: string;
  sourceId: string;
  kind: EvidenceKind;
  sourceRef: string;
  title: string;
  excerpt: string;
  occurredAt: string;
  recordedAt: string;
  broadRegion: "Barat" | "Tengah" | "Timur" | null;
}

export interface GraphNode {
  id: string;
  caseId: string;
  label: string;
  handle?: string;
  role?: string;
  avatarInitials?: string;
}

export interface GraphEdge {
  id: string;
  caseId: string;
  sourceNodeId: string;
  targetNodeId: string;
  kind: InteractionType;
  evidenceIds: string[];
}

export interface VerificationRequest {
  id: string;
  caseId: string;
  assigneeId: string;
  requestedBy: string;
  question: string;
  evidenceIds: string[];
  status: VerificationStatus;
  createdAt: string;
  resolvedAt?: string;
  outcomeNote?: string;
}

export interface ReportReviewEntry {
  id: string;
  reviewerId: string;
  action: "approved" | "rejected";
  note: string;
  timestamp: string;
}

export interface Report {
  id: string;
  caseId: string;
  version: number;
  authorId: string;
  status: ReportStatus;
  approvedBy?: string;
  approvedAt?: string;
  snapshot: {
    summary: string;
    limitations: string;
    proposedClarification: string;
    evidenceIds: string[];
    verificationRequestId?: string;
  };
  reviewHistory?: ReportReviewEntry[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: Role;
  entityType: "case" | "evidence" | "verification" | "report" | "import_batch" | "system";
  entityId: string;
  action: string;
  previousState?: string | null;
  newState?: string | null;
  details?: string;
}

export interface ImportBatchRecord {
  batchId: string;
  importedAt: string;
  status: "success" | "failed";
  itemCount: number;
  duplicateCount: number;
  message?: string;
}

export interface DemoState {
  fixtureVersion: number;
  demoNow: string;
  users: User[];
  backgroundUsers: User[];
  sources: Source[];
  cases: DigitalCase[];
  evidence: Evidence[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  verificationRequests: VerificationRequest[];
  reports: Report[];
  auditLogs: AuditEntry[];
  importHistory: ImportBatchRecord[];
}

export interface DemoActionsConfig {
  requestTemplate: {
    caseId: string;
    assigneeId: string;
    question: string;
    evidenceIds: string[];
  };
  verificationResult: {
    status: VerificationStatus;
    outcomeNote: string;
  };
  validImport: {
    batchId: string;
    evidence: Evidence;
  };
  invalidImport: {
    batchId: string;
    caseId: string;
    reason: string;
  };
}

export type StorageError =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INVALID_TRANSITION"
  | "VERIFICATION_REQUIRED"
  | "EVIDENCE_REQUIRED";

// ---------------------------------------------------------------------------
// Deep Profiling & Anonymous Account Discovery Types (Maltego / Sherlock / OSINT)
// ---------------------------------------------------------------------------

export interface PlatformFootprint {
  platform: string;
  category: "social" | "messaging" | "forum" | "code" | "darkweb";
  username: string;
  url: string;
  status: "found" | "not_found" | "suspicious";
  matchConfidence: number; // 0 - 100
  lastActive: string;
  followersCount?: number;
}

export interface StylometryProfile {
  detectedDialect: string;
  dialectConfidence: number;
  emotionalTone: string;
  vocabularyLevel: string;
  dominantKeyPhrases: string[];
  punctuationPattern: string;
  slangIndicators: string[];
}

export interface CircadianProfile {
  peakPostingHours: string;
  estimatedTimezone: string;
  routinePattern: string;
  sleepIntervalEstimate: string;
  activityMatrix: number[][]; // 7 days x 24 hours (0-10 intensity)
}

export interface ForensicMetadata {
  deviceModel: string;
  osVersion: string;
  browserUserAgent: string;
  cameraExifHardware?: string;
  ipAddress: string;
  asnIsp: string;
  cellTowerId: string;
  cellTowerLocation: string;
  estimatedCoordinates: { lat: number; lng: number; accuracyMeters: number };
}

export interface CrossDatabaseMatch {
  nikCandidate?: string;
  fullName?: string;
  registeredAddress?: string;
  msisdnPhone?: string;
  providerName?: string;
  vehiclePlates?: string;
  vehicleModel?: string;
  passportStatus?: string;
  confidenceScore: number;
}

export interface MaltegoEntityNode {
  id: string;
  type: "account" | "device" | "phone" | "identity" | "location" | "vehicle";
  label: string;
  subtitle: string;
  severity: "high" | "medium" | "low";
}

export interface MaltegoRelationEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  evidenceSource: string;
}

export interface AnonymousDossier {
  id: string;
  targetHandle: string;
  caseAssociation: string;
  riskScore: number;
  threatLevel: "KRITIS" | "TINGGI" | "SEDANG" | "RENDAH";
  summaryStatus: string;
  footprint: PlatformFootprint[];
  stylometry: StylometryProfile;
  circadian: CircadianProfile;
  forensics: ForensicMetadata;
  crossDb: CrossDatabaseMatch;
  maltegoGraph: {
    nodes: MaltegoEntityNode[];
    edges: MaltegoRelationEdge[];
  };
}
