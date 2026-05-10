"use client";

import { useEffect, useState } from "react";

interface LiveCounterProps {
  startTime: Date;
  className?: string;
}

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s} sec ago`;
  return `${m} min ${s.toString().padStart(2, "0")} sec ago`;
}

export default function LiveCounter({ startTime, className = "" }: LiveCounterProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`font-mono ${className}`}>
      {formatElapsed(now - startTime.getTime())}
    </span>
  );
}
