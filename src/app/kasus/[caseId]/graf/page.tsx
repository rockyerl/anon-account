"use client";

import React from "react";
import { ShellLayout, CaseWorkspaceView } from "@/features/digital-analysis";

export default function CaseGraphPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = React.use(params);

  return (
    <ShellLayout>
      <CaseWorkspaceView caseId={caseId} defaultTab="graph" />
    </ShellLayout>
  );
}
