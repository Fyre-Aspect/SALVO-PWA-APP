"use client";

import { useEffect, useState } from "react";
import type { DistressEvent } from "./distress-store";

export type { DistressEvent };

export function useDistressStream(maxEvents = 50) {
  const [events, setEvents] = useState<DistressEvent[]>([]);
  const [latest, setLatest] = useState<DistressEvent | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/distress/stream");

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const event: DistressEvent = JSON.parse(e.data);
        setLatest(event);
        setEvents((prev) => [event, ...prev].slice(0, maxEvents));
      } catch {
        // ignore malformed messages
      }
    };

    es.onerror = () => setConnected(false);

    return () => es.close();
  }, [maxEvents]);

  return { events, latest, connected };
}
