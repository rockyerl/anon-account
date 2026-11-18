"use client";

import React from "react";
import { ShellLayout, VerificationQueueView } from "@/features/digital-analysis";

export default function VerificationDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = React.use(params);

  return (
    <ShellLayout>
      <VerificationQueueView selectedRequestId={requestId} />
    </ShellLayout>
  );
}
