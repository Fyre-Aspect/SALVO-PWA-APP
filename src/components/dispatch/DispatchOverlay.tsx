"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ExternalLink, X } from "lucide-react";
import type { Incident } from "@/types";
import ActionButton from "@/components/ui/ActionButton";
import MapView from "./MapView";
import { confirmDispatch } from "@/services/firebase";

interface DispatchOverlayProps {
  open: boolean;
  incident: Incident | null;
  responderId: string;
  onClose: () => void;
  onArrived: () => void;
}

function formatEta(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} min ${s.toString().padStart(2, "0")} sec`;
}

export default function DispatchOverlay({
  open,
  incident,
  responderId,
  onClose,
  onArrived,
}: DispatchOverlayProps) {
  const reduce = useReducedMotion();
  // Synthetic ETA countdown — 4m 12s shrinking by 1s
  const [etaSec, setEtaSec] = useState(4 * 60 + 12);

  useEffect(() => {
    if (!open) {
      setEtaSec(4 * 60 + 12);
      return;
    }
    const id = setInterval(() => {
      setEtaSec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [open]);

  // Confirm dispatch (fire-and-forget) when overlay opens
  useEffect(() => {
    if (open && incident) {
      void confirmDispatch(incident.id, responderId);
    }
  }, [open, incident, responderId]);

  // Close on Escape + scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function openInGoogleMaps() {
    if (!incident?.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(incident?.zone ?? "")}`, "_blank");
      return;
    }
    const { lat, lng } = incident.location;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
      "_blank"
    );
  }

  return (
    <AnimatePresence>
      {open && incident && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          aria-modal
          role="dialog"
          aria-label="Dispatch route"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          {/* Map (top 60%) */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex-[3]"
          >
            <MapView incident={incident} />
            <button
              type="button"
              aria-label="Close dispatch"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border-bright)",
                color: "var(--color-text-primary)",
              }}
            >
              <X size={16} />
            </button>
          </motion.div>

          {/* Bottom sheet (40%) */}
          <motion.section
            initial={reduce ? { opacity: 0 } : { y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
            className="relative flex-[2] border-t"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border-bright)" }}
          >
            <div className="max-w-3xl mx-auto px-6 py-6 h-full flex flex-col gap-4 overflow-y-auto">
              <div>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.25em]"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Dispatching to
                </p>
                <h2 className="font-display font-bold text-[20px] tracking-tight mt-1">
                  {incident.zone}
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-4 py-2">
                <Metric label="ETA" value={formatEta(etaSec)} accent="critical" big />
                <Metric label="Distance" value={`${incident.nearestDistanceKm.toFixed(1)} km`} />
                <Metric label="Route" value="FASTEST" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <ActionButton
                  variant="ghost"
                  onClick={openInGoogleMaps}
                  icon={<ExternalLink size={14} />}
                >
                  Open in Google Maps
                </ActionButton>
                <ActionButton variant="confirm" onClick={onArrived} fullWidth>
                  I&apos;ve Arrived
                </ActionButton>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="self-center font-mono text-[11px] uppercase tracking-widest hover:underline"
                style={{ color: "var(--color-text-dim)" }}
              >
                Cancel dispatch
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Metric({
  label,
  value,
  accent,
  big,
}: {
  label: string;
  value: string;
  accent?: "critical";
  big?: boolean;
}) {
  return (
    <div
      className="px-4 py-3 border"
      style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}
    >
      <div
        className="font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ color: "var(--color-text-dim)" }}
      >
        {label}
      </div>
      <div
        className={`font-display font-extrabold mt-1 tabular-nums ${big ? "text-[26px]" : "text-[16px]"}`}
        style={{ color: accent === "critical" ? "var(--color-critical)" : "var(--color-text-primary)" }}
      >
        {value}
      </div>
    </div>
  );
}
