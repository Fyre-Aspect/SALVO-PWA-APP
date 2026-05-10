import type { Incident } from "@/types";

const detectedAt = new Date(Date.now() - 134_000); // 2m 14s ago

export const mockIncident: Incident = {
  id: "INC-20250509-0042",
  zone: "Sector 7 — North Entrance",
  severity: "critical",
  detectedAt,
  snapshotUrl: null,
  liveFeedUrl: "https://salvo.local/feed/sector-7",
  status: "active",
  nearbyResponders: 3,
  nearestEta: "~3 min",
  nearestDistanceKm: 0.8,
  location: { lat: 43.6532, lng: -79.3832 }, // Toronto placeholder
  aiLog: [
    {
      timestamp: new Date(detectedAt.getTime() + 1_000),
      message: "Threat classification: CRITICAL — armed individual detected",
    },
    {
      timestamp: new Date(detectedAt.getTime() + 2_000),
      message: "Alert sent to 4 nearest responders",
    },
    {
      timestamp: new Date(detectedAt.getTime() + 3_000),
      message: "Zone lockdown protocol initiated",
    },
    {
      timestamp: new Date(detectedAt.getTime() + 7_000),
      message: "Emergency services auto-notified",
    },
    {
      timestamp: new Date(detectedAt.getTime() + 10_000),
      message: "Crowd dispersal recommended — 12 civilians in zone",
    },
  ],
};

export const sampleZones = [
  "North District",
  "South District",
  "Sector 1 — Riverside",
  "Sector 3 — Marketplace",
  "Sector 7 — North Entrance",
  "Sector 12 — Industrial",
];
