"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VideoFeed from "@/components/dashboard/VideoFeed";
import StatusBar from "@/components/dashboard/StatusBar";
import SystemLog from "@/components/dashboard/SystemLog";

export default function DashboardPage() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#050a12" }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-ocean-surface/15">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-600 hover:text-ocean-cyan transition-colors text-sm"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-bold tracking-wider text-white">
            SALVO <span className="text-ocean-cyan font-normal">COMMAND</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-green-400">ACTIVE</span>
          </div>
          <span className="text-xs font-mono text-gray-600">{time}</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-4">
        {/* Left: Video feed + status bar */}
        <div className="flex-1 flex flex-col gap-4">
          <VideoFeed />
          <StatusBar />
        </div>

        {/* Right: System log */}
        <div className="lg:w-80 shrink-0">
          <SystemLog />
        </div>
      </div>

      {/* Bottom controls */}
      <footer className="px-6 py-3 border-t border-ocean-surface/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono text-gray-600">
            DRONE-01 | SECTOR 3 | PATROL MODE
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded text-xs font-mono bg-ocean-deep/50 border border-ocean-surface/30 text-gray-400 hover:text-white hover:border-ocean-cyan/30 transition-all">
            DISARM
          </button>
          <button className="px-3 py-1.5 rounded text-xs font-mono bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all">
            DEPLOY
          </button>
        </div>
      </footer>
    </div>
  );
}
