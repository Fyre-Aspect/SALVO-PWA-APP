"use client";

import { ReactNode } from "react";

interface FluidGlassProps {
  children?: ReactNode;
  mode?: "lens" | "bar" | "cube";
  scale?: number;
  ior?: number;
  thickness?: number;
  lensProps?: Record<string, unknown>;
  barProps?: Record<string, unknown>;
  cubeProps?: Record<string, unknown>;
  transmission?: number;
  roughness?: number;
  chromaticAberration?: number;
  anisotropy?: number;
}

export default function FluidGlass({
  children,
}: FluidGlassProps) {
  return (
    <div className="relative group" style={{ height: "400px" }}>
      {/* Animated shimmer effect */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,26,51,0.7) 0%, rgba(0,102,204,0.15) 50%, rgba(0,229,255,0.1) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0,229,255,0.15)",
        }}
      >
        {/* Moving highlight */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(0,229,255,0.07) 45%, rgba(0,229,255,0.13) 50%, rgba(0,229,255,0.07) 55%, transparent 60%)",
            animation: "shimmer 4s ease-in-out infinite",
          }}
        />
      </div>

      {/* Content inside the glass */}
      <div className="relative z-10 h-full flex items-center justify-center p-8">
        {children}
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
