"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { systemEvents, stateColors, type SystemState } from "@/data/mock";

export default function SystemLog() {
  const [visibleEvents, setVisibleEvents] = useState<typeof systemEvents>([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < systemEvents.length) {
        setVisibleEvents((prev) => [...prev, systemEvents[index]]);
        index++;
      } else {
        // Reset and replay
        index = 0;
        setVisibleEvents([]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg bg-ocean-darker border border-ocean-surface/20 overflow-hidden">
      <div className="px-4 py-2 border-b border-ocean-surface/20 flex items-center justify-between">
        <span className="text-xs font-mono text-gray-500">SYSTEM LOG</span>
        <span className="text-[10px] font-mono text-ocean-cyan/40">
          {visibleEvents.length} events
        </span>
      </div>
      <div className="p-2 max-h-[300px] overflow-y-auto space-y-1">
        <AnimatePresence>
          {visibleEvents.map((event, i) => (
            <motion.div
              key={`${event.time}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono hover:bg-ocean-deep/30"
            >
              <span className="text-gray-600 w-16 shrink-0">{event.time}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-bold w-16 text-center shrink-0"
                style={{
                  color: stateColors[event.state as SystemState],
                  backgroundColor: `${stateColors[event.state as SystemState]}15`,
                  border: `1px solid ${stateColors[event.state as SystemState]}30`,
                }}
              >
                {event.state}
              </span>
              <span className="text-gray-400 truncate">{event.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {visibleEvents.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-xs font-mono">
            <span className="animate-pulse">Awaiting events...</span>
          </div>
        )}
      </div>
    </div>
  );
}
