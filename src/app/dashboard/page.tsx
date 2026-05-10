"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import IncidentCard from "@/components/incident/IncidentCard";
import FalseAlarmModal from "@/components/modals/FalseAlarmModal";
import DispatchOverlay from "@/components/dispatch/DispatchOverlay";
import { useApp } from "@/context/AppContext";

function DashboardHeader({ name }: { name: string }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b"
      style={{ borderColor: "var(--color-ocean-surface)", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "rgba(0,61,102,0.4)" }}
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-600 hover:text-ocean-cyan transition-colors text-sm">
          ← Back
        </Link>
        <h1 className="text-lg font-bold tracking-wider text-white">
          SALVO <span className="font-normal" style={{ color: "var(--color-ocean-cyan)" }}>COMMAND</span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-mono text-green-400">ACTIVE</span>
        </div>
        <span className="text-xs font-mono text-gray-600">{name}</span>
        <span className="text-xs font-mono text-gray-600">{time}</span>
      </div>
    </header>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, hasHydrated, activeIncident, dispatchMode, openDispatch, closeDispatch, dismissIncident } = useApp();
  const [falseAlarmOpen, setFalseAlarmOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user?.isAuthenticated) {
      router.replace("/auth?redirect=/dashboard");
    }
  }, [hasHydrated, user, router]);

  if (!hasHydrated || !user?.isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-ocean-darker)" }}
      >
        <span className="text-sm font-mono" style={{ color: "var(--color-text-secondary)" }}>
          Verifying credentials…
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-ocean-darker)" }}>
      <DashboardHeader name={user.name} />

      <main className="flex-1 p-6 flex flex-col lg:flex-row gap-4">
        {activeIncident ? (
          <>
            <div className="flex-1 flex flex-col gap-4">
              <IncidentCard
                incident={activeIncident}
                onRespond={openDispatch}
                onDismiss={() => setFalseAlarmOpen(true)}
              />
              {/* Status bar */}
              <div
                className="px-4 py-2.5 rounded-lg text-xs font-mono flex items-center justify-between gap-4 border"
                style={{
                  background: "rgba(0,26,51,0.4)",
                  borderColor: "rgba(0,61,102,0.4)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <span>{activeIncident.nearbyResponders} other responders alerted</span>
                <span className="hidden sm:inline">
                  Nearest: {activeIncident.nearestDistanceKm.toFixed(1)} km
                </span>
                <span>ETA {activeIncident.nearestEta}</span>
              </div>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </main>

      <footer
        className="px-6 py-3 flex items-center justify-between border-t"
        style={{ borderColor: "rgba(0,61,102,0.4)" }}
      >
        <div className="text-[10px] font-mono text-gray-600">
          {user.certificationId} · {user.zone}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openDispatch}
            disabled={!activeIncident}
            className="px-3 py-1.5 rounded text-xs font-mono border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "rgba(0,26,51,0.5)",
              borderColor: "rgba(0,229,255,0.2)",
              color: "var(--color-text-secondary)",
            }}
          >
            DISPATCH
          </button>
        </div>
      </footer>

      <FalseAlarmModal
        open={falseAlarmOpen}
        incidentId={activeIncident?.id ?? "unknown"}
        onClose={() => setFalseAlarmOpen(false)}
        onSubmitted={dismissIncident}
      />
      <DispatchOverlay
        open={dispatchMode}
        incident={activeIncident}
        responderId={user.id}
        onClose={closeDispatch}
        onArrived={closeDispatch}
      />
    </div>
  );
}

function EmptyState() {
  const [uptime, setUptime] = useState(0);
  const [time, setTime] = useState("");

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setUptime(Math.floor((Date.now() - start) / 1000));
      setTime(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const hh = Math.floor(uptime / 3600).toString().padStart(2, "0");
  const mm = Math.floor((uptime % 3600) / 60).toString().padStart(2, "0");
  const ss = (uptime % 60).toString().padStart(2, "0");

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-20 gap-6">
      <Shield size={80} strokeWidth={1.2} style={{ color: "rgba(0,229,255,0.15)" }} />
      <div>
        <h2 className="text-xl font-bold tracking-wider text-white mb-2">MONITORING ACTIVE</h2>
        <p style={{ color: "var(--color-text-secondary)" }}>No incidents detected. Standing by.</p>
      </div>
      <div className="font-mono text-xs flex flex-col sm:flex-row gap-3" style={{ color: "var(--color-text-dim)" }}>
        <span>System time · {time}</span>
        <span aria-hidden>·</span>
        <span>Uptime · {hh}:{mm}:{ss}</span>
      </div>
    </div>
  );
}
