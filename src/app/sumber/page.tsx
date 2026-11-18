"use client";

import React from "react";
import { ShellLayout, AdminSimulationView } from "@/features/digital-analysis";

export default function SumberPage() {
  return (
    <ShellLayout>
      <AdminSimulationView defaultTab="sources" />
    </ShellLayout>
  );
}
