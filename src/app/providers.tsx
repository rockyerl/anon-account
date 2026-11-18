"use client";

import React from "react";
import { DigitalAnalysisProvider } from "@/features/digital-analysis";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DigitalAnalysisProvider>{children}</DigitalAnalysisProvider>;
}
