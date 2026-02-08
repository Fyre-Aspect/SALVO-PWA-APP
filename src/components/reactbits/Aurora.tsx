"use client";

import { useEffect, useRef } from "react";

interface AuroraProps {
  colorStops?: string[];
  blend?: number;
  amplitude?: number;
  speed?: number;
}

export default function Aurora({
  colorStops = ["#001a33", "#0066cc", "#00e5ff"],
  blend = 0.5,
  amplitude = 1.0,
  speed = 1,
}: AuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.005 * speed;

      const layers = container.querySelectorAll<HTMLDivElement>(".aurora-layer");
      layers.forEach((layer, i) => {
        const offset = i * 1.5;
        const x = 50 + Math.sin(time + offset) * 30 * amplitude;
        const y = 50 + Math.cos(time * 0.7 + offset) * 20 * amplitude;
        layer.style.background = `radial-gradient(ellipse at ${x}% ${y}%, ${colorStops[i % colorStops.length]}${Math.round(blend * 99).toString(16).padStart(2, "0")} 0%, transparent 70%)`;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [colorStops, blend, amplitude, speed]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {colorStops.map((_, i) => (
        <div
          key={i}
          className="aurora-layer absolute inset-0"
          style={{ opacity: 0.8 - i * 0.1 }}
        />
      ))}
      <div className="absolute inset-0 bg-ocean-dark/30" />
    </div>
  );
}
