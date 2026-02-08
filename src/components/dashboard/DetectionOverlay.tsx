"use client";

import { detections } from "@/data/mock";

export default function DetectionOverlay() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {detections.map((det) => (
        <div
          key={det.id}
          className="absolute"
          style={{
            left: `${det.x}%`,
            top: `${det.y}%`,
            width: `${det.w}%`,
            height: `${det.h}%`,
          }}
        >
          {/* Bounding box */}
          <div
            className={`absolute inset-0 border-2 ${
              det.distress ? "border-red-500" : "border-yellow-400"
            }`}
            style={{
              animation: det.distress
                ? "pulse-border 1.5s ease-in-out infinite"
                : undefined,
            }}
          >
            {/* Corner markers */}
            <div
              className={`absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 ${
                det.distress ? "border-red-500" : "border-yellow-400"
              }`}
            />
            <div
              className={`absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 ${
                det.distress ? "border-red-500" : "border-yellow-400"
              }`}
            />
            <div
              className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 ${
                det.distress ? "border-red-500" : "border-yellow-400"
              }`}
            />
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 ${
                det.distress ? "border-red-500" : "border-yellow-400"
              }`}
            />
          </div>

          {/* Label */}
          <div
            className={`absolute -top-6 left-0 text-xs font-mono px-1.5 py-0.5 rounded ${
              det.distress
                ? "bg-red-500/80 text-white"
                : "bg-yellow-400/80 text-black"
            }`}
          >
            {det.label} — {Math.round(det.confidence * 100)}%
          </div>

          {/* Distress indicator */}
          {det.distress && (
            <div className="absolute -bottom-6 left-0 text-xs font-mono text-red-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              DISTRESS
            </div>
          )}
        </div>
      ))}

      <style>{`
        @keyframes pulse-border {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
