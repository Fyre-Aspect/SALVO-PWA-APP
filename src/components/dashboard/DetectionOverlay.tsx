"use client";

import { detections } from "@/data/mock";
import { useDistressStream } from "@/lib/useDistressStream";

// Project-Doe pipeline outputs pixel coords — we normalise assuming 640×480.
// Adjust these if the drone camera runs at a different resolution.
const FRAME_W = 640;
const FRAME_H = 480;

function bboxToPercent(bbox: { x1: number; y1: number; x2: number; y2: number }) {
  const x = (bbox.x1 / FRAME_W) * 100;
  const y = (bbox.y1 / FRAME_H) * 100;
  const w = ((bbox.x2 - bbox.x1) / FRAME_W) * 100;
  const h = ((bbox.y2 - bbox.y1) / FRAME_H) * 100;
  return { x, y, w, h };
}

export default function DetectionOverlay() {
  const { latest } = useDistressStream();

  // Use live detection if available, otherwise fall back to mock
  const useLive = latest !== null;
  const liveDetections = useLive
    ? [
        {
          id: latest!.alert.track_id,
          ...bboxToPercent(latest!.alert.bbox),
          label: "Person",
          confidence: latest!.alert.distress_score,
          distress: latest!.alert.level === "critical",
        },
      ]
    : detections.map((d) => ({ ...d }));

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {liveDetections.map((det) => (
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
            {useLive && (
              <span className="ml-1 text-[9px] opacity-70">LIVE</span>
            )}
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
