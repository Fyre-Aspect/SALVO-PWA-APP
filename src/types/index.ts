export type Severity = "critical" | "warning" | "elevated" | "resolved";

export interface User {
  id: string;
  name: string;
  email?: string;
  certificationId?: string;
  zone: string;
  isAuthenticated: boolean;
}

export interface LogEntry {
  timestamp: Date;
  message: string;
}

export interface Incident {
  id: string;
  zone: string;
  severity: Severity;
  detectedAt: Date;
  snapshotUrl: string | null;
  liveFeedUrl: string;
  aiLog: LogEntry[];
  nearbyResponders: number;
  nearestEta: string;
  nearestDistanceKm: number;
  status: "active" | "responding" | "dismissed" | "resolved";
  // Optional live coords for map dispatch
  location?: { lat: number; lng: number };
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  zone: string;
}

export interface FalseAlarmReport {
  incidentId: string;
  reason: string;
  notes: string;
}
