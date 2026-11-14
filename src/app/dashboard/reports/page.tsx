import React from "react";
import { requirePermission } from "@/lib/auth/context";
import { getRecentAuditLogs, AuditLogsView } from "@/features/reports";

export default async function ReportsPage() {
  // Requires "reports.view" permission
  await requirePermission("reports.view");

  const recentLogs = await getRecentAuditLogs(20);

  return <AuditLogsView logs={recentLogs} />;
}
