import React from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileBarChart,
  Settings,
  HelpCircle,
  LucideProps,
} from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  switch (name) {
    case "LayoutDashboard":
      return <LayoutDashboard {...props} />;
    case "Users":
      return <Users {...props} />;
    case "ShieldCheck":
      return <ShieldCheck {...props} />;
    case "FileBarChart":
      return <FileBarChart {...props} />;
    case "Settings":
      return <Settings {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
}
