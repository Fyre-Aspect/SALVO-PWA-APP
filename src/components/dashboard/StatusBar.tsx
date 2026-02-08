"use client";

import { useEffect, useState } from "react";
import { systemStates, stateColors, type SystemState } from "@/data/mock";

export default function StatusBar() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % systemStates.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentState = systemStates[activeIndex];

  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-ocean-darker border border-ocean-surface/20">
      <div className="text-xs font-mono text-gray-500 mr-2">STATE:</div>
      {systemStates.map((state, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;
        return (
          <div
            key={state}
            className="flex items-center gap-1.5"
          >
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: isActive
                  ? stateColors[state as SystemState]
                  : isPast
                  ? stateColors[state as SystemState]
                  : "#1a2a3a",
                opacity: isActive ? 1 : isPast ? 0.4 : 0.15,
                boxShadow: isActive
                  ? `0 0 8px ${stateColors[state as SystemState]}`
                  : "none",
              }}
            />
            <span
              className={`text-[10px] font-mono transition-colors duration-300 ${
                isActive ? "text-white" : isPast ? "text-gray-600" : "text-gray-700"
              }`}
            >
              {state}
            </span>
            {i < systemStates.length - 1 && (
              <span className="text-gray-700 mx-1 text-[10px]">→</span>
            )}
          </div>
        );
      })}
      <div className="ml-auto flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: stateColors[currentState] }}
        />
        <span
          className="text-xs font-mono font-bold"
          style={{ color: stateColors[currentState] }}
        >
          {currentState}
        </span>
      </div>
    </div>
  );
}
