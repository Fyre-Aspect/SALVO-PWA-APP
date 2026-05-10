"use client";

import Image from "next/image";
import { Camera, Check, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Incident } from "@/types";
import SeverityBadge from "./SeverityBadge";
import LogFeed from "./LogFeed";
import LiveCounter from "@/components/ui/LiveCounter";
import PulsingIndicator from "@/components/ui/PulsingIndicator";

interface IncidentCardProps {
  incident: Incident;
  onRespond: () => void;
  onDismiss: () => void;
}

export default function IncidentCard({ incident, onRespond, onDismiss }: IncidentCardProps) {
  const reduce = useReducedMotion();
  const dimmed = incident.status === "dismissed";

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-xl overflow-hidden"
      style={{ opacity: dimmed ? 0.5 : 1, transition: "opacity 0.3s ease" }}
      aria-labelledby="incident-zone"
    >
      <div className="grid lg:grid-cols-[1.2fr_1fr]">
        {/* ───── Left — Visual feed ───── */}
        <div className="relative">
          <div
            className="relative aspect-video tactical-grid"
            style={{ background: "rgba(0,10,20,0.8)" }}
          >
            {incident.snapshotUrl ? (
              <Image
                src={incident.snapshotUrl}
                alt={`Snapshot from ${incident.zone}`}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Camera size={36} strokeWidth={1.2} style={{ color: "rgba(0,229,255,0.2)" }} />
                <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "rgba(0,229,255,0.3)" }}>
                  Snapshot Feed
                </span>
              </div>
            )}

            {/* Rec badge */}
            <div
              className="absolute top-3 left-3 inline-flex items-center gap-2 px-2 py-1 rounded"
              style={{ background: "rgba(0,10,20,0.8)" }}
            >
              <PulsingIndicator color="red" size={6} />
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(0,229,255,0.5)" }}>
                REC · Live Feed
              </span>
            </div>

            {/* Severity banner */}
            <div
              className="absolute bottom-0 inset-x-0 px-4 py-2 flex items-center justify-between"
              style={{
                background:
                  incident.severity === "critical"
                    ? "var(--color-critical)"
                    : incident.severity === "warning"
                    ? "var(--color-warning)"
                    : incident.severity === "elevated"
                    ? "var(--color-ocean-blue)"
                    : "var(--color-safe)",
              }}
            >
              <span className="font-bold text-white tracking-widest text-[13px] uppercase">
                {incident.severity}
              </span>
              <span className="font-mono text-[10px] text-white/70">{incident.id}</span>
            </div>
          </div>
        </div>

        {/* ───── Right — Intelligence ───── */}
        <div className="p-5 lg:p-6 flex flex-col gap-4">
          <header className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(0,229,255,0.4)" }}>
                Incident ID · {incident.id}
              </span>
              <h2 id="incident-zone" className="text-lg font-bold text-white">
                {incident.zone}
              </h2>
            </div>
            <SeverityBadge severity={incident.severity} animated />
          </header>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(0,229,255,0.4)" }}>
              Detected
            </span>
            <LiveCounter
              startTime={incident.detectedAt}
              className="text-[13px] tabular-nums text-white"
            />
          </div>

          <div className="border-t" style={{ borderColor: "rgba(0,61,102,0.4)" }} />

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(0,229,255,0.4)" }}>
              // AI Triage Log
            </p>
            <LogFeed entries={incident.aiLog} />
          </div>

          <div className="border-t" style={{ borderColor: "rgba(0,61,102,0.4)" }} />

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRespond}
              disabled={dimmed}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--color-safe)", color: "#0a1a10" }}
            >
              <Check size={15} strokeWidth={2.5} />
              Respond Now
            </button>
            <button
              onClick={onDismiss}
              disabled={dimmed}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "rgba(0,26,51,0.5)",
                borderColor: "rgba(0,229,255,0.2)",
                color: "var(--color-text-secondary)",
              }}
            >
              <X size={15} strokeWidth={2.5} />
              False Alarm
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
