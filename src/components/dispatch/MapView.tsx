"use client";

import { Crosshair, MapPin, Navigation } from "lucide-react";
import type { Incident } from "@/types";

interface MapViewProps {
  incident: Incident;
}

/**
 * Stubbed map. Real Google Maps / Mapbox lands in Phase 2.
 * We render a stylised tactical overlay with route line and pulsing markers
 * so the dispatch UX is fully exercised without API keys.
 */
export default function MapView({ incident }: MapViewProps) {
  return (
    <div
      className="relative w-full h-full overflow-hidden tactical-grid"
      style={{ background: "var(--color-surface-2)" }}
      aria-label={`Map showing route to ${incident.zone}`}
      role="img"
    >
      {/* Topographic SVG simulation */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern id="topo" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M0,30 Q15,15 30,30 T60,30"
              fill="none"
              stroke="var(--color-border-bright)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="800" height="600" fill="url(#topo)" />
        {/* "Roads" */}
        <path
          d="M50,500 L300,420 L500,300 L720,180"
          stroke="var(--color-border-bright)"
          strokeWidth="2"
          fill="none"
        />
        <path d="M0,300 L800,260" stroke="var(--color-border-bright)" strokeWidth="1" fill="none" />
        <path d="M400,0 L420,600" stroke="var(--color-border-bright)" strokeWidth="1" fill="none" />
      </svg>

      {/* Route line — responder to incident */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M150,470 Q300,400 420,330 T680,180"
          stroke="var(--color-critical)"
          strokeWidth="3"
          strokeDasharray="6 6"
          fill="none"
          filter="url(#glow)"
        />
      </svg>

      {/* Responder marker */}
      <div className="absolute" style={{ left: "18%", top: "78%" }}>
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <div
            className="absolute inset-0 rounded-full -m-3"
            style={{
              background: "var(--color-accent)",
              opacity: 0.25,
              animation: "salvo-pulse-marker 1.8s ease-out infinite",
            }}
          />
          <div
            className="relative w-7 h-7 flex items-center justify-center"
            style={{ background: "var(--color-accent)" }}
          >
            <Navigation size={14} fill="#fff" stroke="#fff" />
          </div>
        </div>
      </div>

      {/* Incident marker */}
      <div className="absolute" style={{ left: "84%", top: "30%" }}>
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <div
            className="absolute inset-0 rounded-full -m-4"
            style={{
              background: "var(--color-critical)",
              opacity: 0.35,
              animation: "salvo-pulse-marker 1.6s ease-out infinite",
            }}
          />
          <div
            className="relative w-8 h-8 flex items-center justify-center"
            style={{ background: "var(--color-critical)" }}
          >
            <MapPin size={16} fill="#fff" stroke="#fff" />
          </div>
        </div>
      </div>

      {/* HUD */}
      <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)]">
        <Crosshair size={14} />
        <span>Tactical Overlay</span>
      </div>
      <div className="absolute top-4 right-4 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)]">
        {incident.location
          ? `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`
          : "GPS · Sim mode"}
      </div>
    </div>
  );
}
