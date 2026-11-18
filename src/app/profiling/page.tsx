"use client";

import React from "react";
import { ShellLayout, DeepProfilingView } from "@/features/digital-analysis";

export default function ProfilingPage() {
  return (
    <ShellLayout>
      <DeepProfilingView />
    </ShellLayout>
  );
}
