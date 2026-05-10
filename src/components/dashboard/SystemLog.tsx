"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { systemEvents, stateColors, type SystemState } from "@/data/mock";
import { useDistressStream } from "@/lib/useDistressStream";

interface LogEntry {
  id: string;
  time: string;
  state: SystemState;
  msg: string;
  live?: boolean;
}

function alertToEntries(event: import("@/lib/useDistressStream").DistressEvent): LogEntry[] {
  const ts = new Date(event.received_at);
  const time = ts.toLocaleTimeString("en-US", { hour12: false });
  const { alert, source_id } = event;
  const scoreStr = Math.round(alert.distress_score * 100);

  const entries: LogEntry[] = [
    {
      id: `${event.received_at}-detect`,
      time,
      state: "DETECT",
      msg: `Human detected — ${source_id} (track #${alert.track_id})`,
      live: true,
    },
    {
      id: `${event.received_at}-assess`,
      time,
      state: "ASSESS",
      msg: `Distress score: ${scoreStr}/100 — ${alert.gesture || "unknown gesture"}`,
      live: true,
    },
    {
      id: `${event.received_at}-alert`,
      time,
      state: alert.level === "critical" ? "ALERT" : "ASSESS",
      msg: `${alert.level.toUpperCase()} alert — frame #${alert.frame_id}`,
      live: true,
    },
  ];

  return entries;
}

export default function SystemLog() {
  const { events: liveEvents, connected } = useDistressStream();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const mockIndexRef = useRef(0);

  // Seed with mock events when no live data yet
  useEffect(() => {
    if (liveEvents.length > 0) return;
    let index = mockIndexRef.current;
    const interval = setInterval(() => {
      if (index < systemEvents.length) {
        const e = systemEvents[index];
        setEntries((prev) => [
          { id: `mock-${index}`, time: e.time, state: e.state, msg: e.msg },
          ...prev,
        ]);
        index++;
        mockIndexRef.current = index;
      } else {
        index = 0;
        mockIndexRef.current = 0;
        setEntries([]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [liveEvents.length]);

  // Prepend live entries when new events arrive
  useEffect(() => {
    if (liveEvents.length === 0) return;
    const newest = liveEvents[0];
    const newEntries = alertToEntries(newest);
    setEntries((prev) => [...newEntries, ...prev].slice(0, 100));
  }, [liveEvents]);

  const displayed = entries.slice(0, 30);

  return (
    <div className="rounded-lg bg-ocean-darker border border-ocean-surface/20 overflow-hidden">
      <div className="px-4 py-2 border-b border-ocean-surface/20 flex items-center justify-between">
        <span className="text-xs font-mono text-gray-500">SYSTEM LOG</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-ocean-cyan/40">
            {displayed.length} events
          </span>
          <div className="flex items-center gap-1">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: connected ? "#00e676" : "#555",
                boxShadow: connected ? "0 0 4px #00e676" : "none",
              }}
            />
            <span className="text-[10px] font-mono text-gray-600">
              {connected ? "LIVE" : "DEMO"}
            </span>
          </div>
        </div>
      </div>
      <div className="p-2 max-h-[300px] overflow-y-auto space-y-1">
        <AnimatePresence>
          {displayed.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono hover:bg-ocean-deep/30 ${
                entry.live ? "bg-ocean-deep/20" : ""
              }`}
            >
              <span className="text-gray-600 w-16 shrink-0">{entry.time}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-bold w-16 text-center shrink-0"
                style={{
                  color: stateColors[entry.state as SystemState],
                  backgroundColor: `${stateColors[entry.state as SystemState]}15`,
                  border: `1px solid ${stateColors[entry.state as SystemState]}30`,
                }}
              >
                {entry.state}
              </span>
              <span className="text-gray-400 truncate">{entry.msg}</span>
              {entry.live && (
                <span className="ml-auto text-[9px] text-ocean-cyan/50 shrink-0">●</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {displayed.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-xs font-mono">
            <span className="animate-pulse">Awaiting events...</span>
          </div>
        )}
      </div>
    </div>
  );
}
