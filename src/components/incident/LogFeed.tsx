"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { LogEntry } from "@/types";

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour12: false });
}

export default function LogFeed({ entries, maxHeight = 180 }: { entries: LogEntry[]; maxHeight?: number }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="font-mono text-[11px] py-4 text-center" style={{ color: "var(--color-text-dim)", minHeight: 80 }}>
        Awaiting AI triage data…
      </div>
    );
  }

  return (
    <div ref={scrollerRef} className="overflow-y-auto" style={{ maxHeight }} role="log" aria-live="polite">
      <ul className="space-y-1.5">
        <AnimatePresence initial={false}>
          {entries.map((entry, i) => {
            const isLatest = i === entries.length - 1;
            return (
              <motion.li
                key={`${entry.timestamp.getTime()}-${i}`}
                initial={reduce ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="flex items-start gap-2 font-mono text-[11px] leading-relaxed"
              >
                <span className="shrink-0 tabular-nums" style={{ color: "rgba(0,229,255,0.3)" }}>
                  [{fmtTime(entry.timestamp)}]
                </span>
                <span style={{ color: isLatest ? "var(--color-ocean-cyan)" : "var(--color-text-secondary)" }}>
                  {entry.message}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
