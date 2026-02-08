"use client";

import DetectionOverlay from "./DetectionOverlay";

export default function VideoFeed() {
  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-ocean-surface/30 bg-ocean-darker">
      {/* Simulated water/camera view */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 40%, rgba(0,40,80,0.8) 0%, transparent 70%),
            radial-gradient(ellipse at 70% 60%, rgba(0,30,60,0.6) 0%, transparent 60%),
            linear-gradient(180deg, #0a1628 0%, #0d2137 30%, #0a3050 60%, #071e30 100%)
          `,
        }}
      >
        {/* Animated scan lines */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.05) 2px, rgba(0,229,255,0.05) 4px)",
          }}
        />

        {/* Moving scan line */}
        <div
          className="absolute left-0 right-0 h-px bg-ocean-cyan/30"
          style={{ animation: "scanline 3s linear infinite" }}
        />

        {/* Water wave simulation */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='20' viewBox='0 0 100 20'%3E%3Cpath d='M0 10 Q 25 0, 50 10 T 100 10' fill='none' stroke='%2300e5ff' stroke-width='0.5'/%3E%3C/svg%3E\")",
            backgroundSize: "100px 20px",
            animation: "waves 4s linear infinite",
          }}
        />
      </div>

      {/* Detection boxes */}
      <DetectionOverlay />

      {/* Camera HUD overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Top-left info */}
        <div className="absolute top-3 left-3 font-mono text-[10px] text-ocean-cyan/60 space-y-0.5">
          <div>CAM 01 — RGB 1080p</div>
          <div>FPS: 30 | LAT: 12ms</div>
        </div>

        {/* Top-right recording indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 font-mono text-[10px] text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          REC
        </div>

        {/* Center crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-ocean-cyan/20"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
          >
            <line x1="32" y1="0" x2="32" y2="24" strokeWidth="0.5" />
            <line x1="32" y1="40" x2="32" y2="64" strokeWidth="0.5" />
            <line x1="0" y1="32" x2="24" y2="32" strokeWidth="0.5" />
            <line x1="40" y1="32" x2="64" y2="32" strokeWidth="0.5" />
            <circle cx="32" cy="32" r="8" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between font-mono text-[10px] text-ocean-cyan/40">
          <div>SECTOR 3 — SWEEP MODE</div>
          <div>ALT: 30m | SPD: 5.2 m/s</div>
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes waves {
          0% { background-position: 0 0; }
          100% { background-position: 100px 0; }
        }
      `}</style>
    </div>
  );
}
