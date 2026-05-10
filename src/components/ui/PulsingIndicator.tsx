"use client";

interface PulsingIndicatorProps {
  color?: "red" | "green" | "amber" | "blue";
  size?: number;
  label?: string;
  className?: string;
}

const COLORS: Record<NonNullable<PulsingIndicatorProps["color"]>, string> = {
  red: "var(--color-critical)",
  green: "var(--color-safe)",
  amber: "var(--color-warning)",
  blue: "var(--color-accent)",
};

export default function PulsingIndicator({
  color = "red",
  size = 8,
  label,
  className = "",
}: PulsingIndicatorProps) {
  const c = COLORS[color];
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex" style={{ width: size, height: size }}>
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: c, animation: "salvo-pulse-marker 1.6s ease-out infinite" }}
        />
        <span
          className="relative inline-block rounded-full animate-blink"
          style={{ width: size, height: size, backgroundColor: c }}
        />
      </span>
      {label ? (
        <span className="font-mono text-[11px] tracking-widest" style={{ color: c }}>
          {label}
        </span>
      ) : null}
    </span>
  );
}
