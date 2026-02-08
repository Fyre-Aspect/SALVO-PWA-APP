"use client";

import { useRef, useEffect, ReactNode } from "react";

interface MagicBentoProps {
  children: ReactNode;
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
  disableAnimations?: boolean;
}

export default function MagicBento({
  children,
  enableSpotlight = true,
  enableBorderGlow = true,
  spotlightRadius = 400,
  glowColor = "0, 229, 255",
}: MagicBentoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enableSpotlight) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = container.querySelectorAll<HTMLDivElement>(".bento-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [enableSpotlight]);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      style={
        {
          "--spotlight-radius": `${spotlightRadius}px`,
          "--glow-color": glowColor,
        } as React.CSSProperties
      }
    >
      <style>{`
        .bento-card {
          position: relative;
          overflow: hidden;
          background: rgba(0, 26, 51, 0.5);
          border: 1px solid rgba(${glowColor}, 0.1);
          border-radius: 1rem;
          transition: border-color 0.3s ease;
        }
        .bento-card:hover {
          border-color: rgba(${glowColor}, ${enableBorderGlow ? 0.5 : 0.1});
          ${enableBorderGlow ? `box-shadow: 0 0 30px rgba(${glowColor}, 0.15), inset 0 0 30px rgba(${glowColor}, 0.05);` : ""}
        }
        ${
          enableSpotlight
            ? `.bento-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(
            var(--spotlight-radius) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(${glowColor}, 0.08),
            transparent 60%
          );
          pointer-events: none;
          z-index: 1;
        }`
            : ""
        }
      `}</style>
      {children}
    </div>
  );
}
