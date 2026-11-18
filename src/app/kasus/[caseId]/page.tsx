"use client";

import React from "react";
import { ShellLayout, CaseWorkspaceView } from "@/features/digital-analysis";

export default function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = React.use(params);

  return (
    <ShellLayout>
      <CaseWorkspaceView caseId={caseId} />
    </ShellLayout>
  );
}
