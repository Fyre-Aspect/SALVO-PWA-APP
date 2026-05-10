"use client";

import { useEffect, useState } from "react";
import PulsingIndicator from "@/components/ui/PulsingIndicator";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-5 md:px-8 h-[60px] border-b"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
    >
      <div className="flex items-baseline gap-3">
        <h1 className="font-display font-bold text-[18px] tracking-wide">{title}</h1>
        {subtitle ? (
          <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)]">
            {subtitle}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        <PulsingIndicator color="red" label="LIVE" />
        <span
          className="font-mono text-[12px] tabular-nums"
          style={{ color: "var(--color-text-secondary)" }}
          aria-label="Current time"
        >
          {time || "--:--:--"}
        </span>
      </div>
    </header>
  );
}
