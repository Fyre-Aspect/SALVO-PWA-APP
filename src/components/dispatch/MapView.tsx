"use client";

import dynamic from "next/dynamic";
import type { Incident } from "@/types";

const DynamicMap = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center tactical-grid"
      style={{ background: "var(--color-surface-2)" }}
    >
      <div className="w-8 h-8 border-2 border-t-transparent border-[var(--color-ocean-cyan)] rounded-full animate-spin mb-4" />
      <span className="text-xs font-mono text-[var(--color-text-secondary)] animate-pulse uppercase tracking-widest">
        Initializing Tactical Map...
      </span>
    </div>
  ),
});

interface MapViewProps {
  incident: Incident;
}

export default function MapView({ incident }: MapViewProps) {
  return <DynamicMap incident={incident} />;
}
