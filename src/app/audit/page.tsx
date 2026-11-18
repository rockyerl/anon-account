"use client";

import React from "react";
import { ShellLayout, AdminSimulationView } from "@/features/digital-analysis";

export default function AuditPage() {
  return (
    <ShellLayout>
      <AdminSimulationView defaultTab="audit" />
    </ShellLayout>
  );
}
