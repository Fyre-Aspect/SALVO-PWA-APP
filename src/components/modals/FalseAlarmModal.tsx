"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Check, X } from "lucide-react";
import ActionButton from "@/components/ui/ActionButton";
import { reportFalseAlarm } from "@/services/firebase";

interface FalseAlarmModalProps {
  open: boolean;
  incidentId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

const REASONS = [
  "No threat present",
  "Already resolved",
  "Wrong zone",
  "Technical glitch",
  "Other",
];

export default function FalseAlarmModal({
  open,
  incidentId,
  onClose,
  onSubmitted,
}: FalseAlarmModalProps) {
  const reduce = useReducedMotion();
  const [reason, setReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason(REASONS[0]);
      setNotes("");
      setSubmitting(false);
      setSuccess(false);
    }
  }, [open]);

  // Lock body scroll while open + close on Escape
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

  async function handleSubmit() {
    setSubmitting(true);
    await reportFalseAlarm({ incidentId, reason, notes });
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      onSubmitted();
      onClose();
    }, 1100);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          aria-modal
          role="dialog"
          aria-labelledby="false-alarm-title"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg border"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border-bright)",
              borderRadius: 0,
            }}
          >
            <div className="p-6">
              {success ? (
                <div className="py-8 flex flex-col items-center gap-3 text-center">
                  <div
                    className="w-12 h-12 flex items-center justify-center"
                    style={{ background: "var(--color-safe-dim)", color: "var(--color-safe)" }}
                  >
                    <Check size={24} />
                  </div>
                  <h3 id="false-alarm-title" className="font-display font-bold text-[18px]">
                    Report submitted. Thank you.
                  </h3>
                  <p
                    className="font-mono text-[11px] uppercase tracking-widest"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Data forwarded to model retraining queue.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3
                        id="false-alarm-title"
                        className="font-display font-bold text-[18px] tracking-tight"
                      >
                        Report false alarm?
                      </h3>
                      <p
                        className="mt-1 text-[13px] leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        This helps improve SALVO&apos;s detection accuracy. Your feedback is anonymized.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close dialog"
                      className="p-1 -m-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <fieldset className="mb-5">
                    <legend
                      className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3"
                      style={{ color: "var(--color-text-dim)" }}
                    >
                      Reason
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {REASONS.map((r) => {
                        const active = r === reason;
                        return (
                          <label
                            key={r}
                            className="cursor-pointer px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors border"
                            style={{
                              background: active ? "var(--color-critical-dim)" : "var(--color-surface)",
                              borderColor: active ? "var(--color-critical)" : "var(--color-border-bright)",
                              color: active ? "var(--color-critical)" : "var(--color-text-secondary)",
                            }}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value={r}
                              checked={active}
                              onChange={() => setReason(r)}
                              className="sr-only"
                            />
                            {r}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <label className="block mb-5">
                    <span
                      className="block font-mono text-[10px] uppercase tracking-[0.2em] mb-2"
                      style={{ color: "var(--color-text-dim)" }}
                    >
                      Additional notes (optional)
                    </span>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Anything that would help our team understand the situation."
                      className="w-full resize-none"
                    />
                  </label>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <ActionButton variant="ghost" onClick={onClose}>
                      Cancel
                    </ActionButton>
                    <ActionButton
                      variant="critical"
                      loading={submitting}
                      onClick={handleSubmit}
                    >
                      Submit Report
                    </ActionButton>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
