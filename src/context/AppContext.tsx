"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type { Incident, LogEntry, Severity, User } from "@/types";
import { signOut as fbSignOut, subscribeToIncidents } from "@/services/firebase";
import type { DistressEvent } from "@/lib/distress-store";

// ─────────────────  State  ─────────────────
interface AppState {
  user: User | null;
  activeIncident: Incident | null;
  dispatchMode: boolean;
  hasHydrated: boolean;
}

type Action =
  | { type: "HYDRATE"; user: User | null }
  | { type: "SIGN_IN"; user: User }
  | { type: "SIGN_OUT" }
  | { type: "SET_INCIDENT"; incident: Incident | null }
  | { type: "APPEND_LOG"; entry: LogEntry }
  | { type: "DISMISS_INCIDENT" }
  | { type: "OPEN_DISPATCH" }
  | { type: "CLOSE_DISPATCH" };

const initialState: AppState = {
  user: null,
  activeIncident: null,
  dispatchMode: false,
  hasHydrated: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, user: action.user, hasHydrated: true };
    case "SIGN_IN":
      return { ...state, user: action.user };
    case "SIGN_OUT":
      return { ...state, user: null, activeIncident: null, dispatchMode: false };
    case "SET_INCIDENT":
      return { ...state, activeIncident: action.incident };
    case "APPEND_LOG":
      if (!state.activeIncident) return state;
      return {
        ...state,
        activeIncident: {
          ...state.activeIncident,
          aiLog: [...state.activeIncident.aiLog, action.entry].slice(-50),
        },
      };
    case "DISMISS_INCIDENT":
      if (!state.activeIncident) return state;
      return {
        ...state,
        activeIncident: { ...state.activeIncident, status: "dismissed" },
        dispatchMode: false,
      };
    case "OPEN_DISPATCH":
      return { ...state, dispatchMode: true };
    case "CLOSE_DISPATCH":
      return { ...state, dispatchMode: false };
    default:
      return state;
  }
}

// ─────────────────  Context  ─────────────────
interface AppContextValue extends AppState {
  setUser: (user: User) => void;
  signOut: () => Promise<void>;
  setIncident: (incident: Incident | null) => void;
  appendLog: (entry: LogEntry) => void;
  dismissIncident: () => void;
  openDispatch: () => void;
  closeDispatch: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "salvo.user";

// ─────────────────  Live event → Incident bridge  ─────────────────
function severityFromLevel(level: string): Severity {
  if (level === "critical") return "critical";
  if (level === "warning") return "warning";
  return "elevated";
}

function eventToIncident(ev: DistressEvent): Incident {
  const detectedAt = new Date(ev.alert.timestamp * 1000 || ev.received_at);
  const gesture = ev.alert.gesture || "distress signal";
  const score = Math.round(ev.alert.distress_score * 100);

  return {
    id: `INC-LIVE-${ev.alert.frame_id}`,
    zone: `${ev.source_id} · Frame #${ev.alert.frame_id}`,
    severity: severityFromLevel(ev.alert.level),
    detectedAt,
    snapshotUrl: ev.snapshot_jpeg_b64
      ? `data:image/jpeg;base64,${ev.snapshot_jpeg_b64}`
      : null,
    liveFeedUrl: `salvo://live/${ev.source_id}`,
    aiLog: [
      {
        timestamp: detectedAt,
        message: `Threat classification: ${ev.alert.level.toUpperCase()} — ${gesture}`,
      },
      {
        timestamp: new Date(detectedAt.getTime() + 1_000),
        message: `Distress score ${score}/100 — track #${ev.alert.track_id}`,
      },
      {
        timestamp: new Date(detectedAt.getTime() + 2_000),
        message: `Webhook ingested from ${ev.source_id}`,
      },
    ],
    nearbyResponders: 3,
    nearestEta: "~2 min",
    nearestDistanceKm: 0.6,
    status: "active",
  };
}

// ─────────────────  Provider  ─────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const incidentSubRef = useRef<(() => void) | null>(null);

  // Restore user from localStorage on mount
  useEffect(() => {
    let user: User | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) user = JSON.parse(raw) as User;
    } catch {
      user = null;
    }
    dispatch({ type: "HYDRATE", user });
  }, []);

  // Persist user
  useEffect(() => {
    if (!state.hasHydrated) return;
    try {
      if (state.user) localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
  }, [state.user, state.hasHydrated]);

  // Subscribe to mock Firebase incident stream while authed (seeds dashboard if no live data)
  useEffect(() => {
    if (!state.user?.isAuthenticated) return;
    if (state.activeIncident) return;
    const unsub = subscribeToIncidents((incident) => {
      dispatch({ type: "SET_INCIDENT", incident });
    });
    incidentSubRef.current = unsub;
    return () => {
      unsub();
      incidentSubRef.current = null;
    };
  }, [state.user, state.activeIncident]);

  // Live SSE bridge — overrides mock with real distress events
  useEffect(() => {
    if (!state.user?.isAuthenticated) return;
    const es = new EventSource("/api/distress/stream");
    es.onmessage = (e) => {
      try {
        const ev: DistressEvent = JSON.parse(e.data);
        dispatch({ type: "SET_INCIDENT", incident: eventToIncident(ev) });
      } catch {
        // ignore malformed
      }
    };
    return () => es.close();
  }, [state.user]);

  const setUser = useCallback((user: User) => dispatch({ type: "SIGN_IN", user }), []);
  const signOut = useCallback(async () => {
    await fbSignOut();
    dispatch({ type: "SIGN_OUT" });
  }, []);
  const setIncident = useCallback(
    (incident: Incident | null) => dispatch({ type: "SET_INCIDENT", incident }),
    []
  );
  const appendLog = useCallback((entry: LogEntry) => dispatch({ type: "APPEND_LOG", entry }), []);
  const dismissIncident = useCallback(() => dispatch({ type: "DISMISS_INCIDENT" }), []);
  const openDispatch = useCallback(() => dispatch({ type: "OPEN_DISPATCH" }), []);
  const closeDispatch = useCallback(() => dispatch({ type: "CLOSE_DISPATCH" }), []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      setUser,
      signOut,
      setIncident,
      appendLog,
      dismissIncident,
      openDispatch,
      closeDispatch,
    }),
    [state, setUser, signOut, setIncident, appendLog, dismissIncident, openDispatch, closeDispatch]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
