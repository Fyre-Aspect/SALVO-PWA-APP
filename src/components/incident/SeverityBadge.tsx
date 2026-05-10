"use client";

import type { Severity } from "@/types";

const META: Record<Severity, { label: string; fg: string; bg: string }> = {
  critical: {
    label: "CRITICAL",
    fg: "var(--color-critical)",
    bg: "var(--color-critical-dim)",
  },
  warning: {
    label: "WARNING",
    fg: "var(--color-warning)",
    bg: "var(--color-warning-dim)",
  },
  elevated: {
    label: "ELEVATED",
    fg: "var(--color-ocean-cyan)",
    bg: "rgba(0,229,255,0.08)",
  },
  resolved: {
    label: "RESOLVED",
    fg: "var(--color-safe)",
    bg: "var(--color-safe-dim)",
  },
};

interface SeverityBadgeProps {
  severity: Severity;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function SeverityBadge({ severity, animated = false }: SeverityBadgeProps) {
  const m = META[severity];
  return (
    <span
      role="status"
      aria-label={`Severity: ${m.label}`}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold tracking-widest ${
        animated && severity === "critical" ? "animate-pulse-critical" : ""
      }`}
      style={{ color: m.fg, background: m.bg, border: `1px solid ${m.fg}30` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: m.fg }}
        aria-hidden
      />
      {m.label}
    </span>
  );
}
