"use client";

import { motion } from "motion/react";
import Link from "next/link";
import TrueFocus from "@/components/reactbits/TrueFocus";

// ── Cloud shapes — two variants for visual variety ────────────────
function CloudA({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 280 100" className={className} style={style} fill="currentColor" aria-hidden>
      <ellipse cx="140" cy="74" rx="128" ry="26" />
      <ellipse cx="92"  cy="58" rx="64"  ry="42" />
      <ellipse cx="178" cy="54" rx="58"  ry="36" />
      <ellipse cx="140" cy="46" rx="50"  ry="34" />
    </svg>
  );
}
function CloudB({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 80" className={className} style={style} fill="currentColor" aria-hidden>
      <ellipse cx="100" cy="60" rx="90"  ry="20" />
      <ellipse cx="64"  cy="48" rx="44"  ry="30" />
      <ellipse cx="142" cy="44" rx="38"  ry="26" />
      <ellipse cx="100" cy="40" rx="34"  ry="24" />
    </svg>
  );
}

// ── Drone SVG ─────────────────────────────────────────────────────
function DroneSVG() {
  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      strokeWidth="1.3"
      className="w-full h-full"
      aria-hidden
    >
      {/* Body */}
      <rect x="47" y="54" width="46" height="32" rx="7" fill="#001a33" stroke="#00e5ff" />
      {/* Vent slits */}
      <line x1="53" y1="62" x2="87" y2="62" stroke="#00e5ff" strokeWidth="0.7" opacity="0.4" />
      <line x1="53" y1="68" x2="87" y2="68" stroke="#00e5ff" strokeWidth="0.7" opacity="0.4" />
      {/* Camera gimbal */}
      <circle cx="70" cy="86" r="6"   fill="#001a33"   stroke="#00e5ff" />
      <circle cx="70" cy="86" r="2.5" fill="#00e5ff"   opacity="0.55" />
      {/* Arms */}
      <line x1="47" y1="61" x2="18" y2="44" stroke="#00e5ff" />
      <line x1="93" y1="61" x2="122" y2="44" stroke="#00e5ff" />
      <line x1="47" y1="79" x2="18" y2="96" stroke="#00e5ff" />
      <line x1="93" y1="79" x2="122" y2="96" stroke="#00e5ff" />
      {/* Motor mounts */}
      <circle cx="18"  cy="44" r="6" fill="#001a33" stroke="#00e5ff" />
      <circle cx="122" cy="44" r="6" fill="#001a33" stroke="#00e5ff" />
      <circle cx="18"  cy="96" r="6" fill="#001a33" stroke="#00e5ff" />
      <circle cx="122" cy="96" r="6" fill="#001a33" stroke="#00e5ff" />
      {/* Rotors (spinning ellipses) */}
      <ellipse cx="18"  cy="44" rx="19" ry="5" stroke="#00e5ff" opacity="0.6" fill="none" />
      <ellipse cx="122" cy="44" rx="19" ry="5" stroke="#00e5ff" opacity="0.6" fill="none" />
      <ellipse cx="18"  cy="96" rx="19" ry="5" stroke="#00e5ff" opacity="0.6" fill="none" />
      <ellipse cx="122" cy="96" rx="19" ry="5" stroke="#00e5ff" opacity="0.6" fill="none" />
      {/* Payload tether */}
      <line x1="70" y1="92" x2="70" y2="126" strokeDasharray="4 3" stroke="#00e5ff" opacity="0.45" />
      <circle cx="70" cy="131" r="6" fill="#00e5ff" fillOpacity="0.12" stroke="#00e5ff" strokeWidth="1" />
    </svg>
  );
}

// ── Hero ──────────────────────────────────────────────────────────
export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center overflow-hidden">
      {/* Background — pure CSS, replaces the rAF-heavy Aurora */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #020810 0%, #040c18 35%, #071020 65%, #0a0f1a 100%)",
        }}
      />
      {/* Radial accent — static, no JS */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,102,204,0.18) 0%, transparent 70%)",
        }}
      />
      {/* Subtle grid */}
      <div className="absolute inset-0 tactical-grid opacity-15 pointer-events-none" />

      {/* ── Clouds — pure CSS animation, zero JS ─────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <CloudA
          className="cloud cloud-1 w-72 absolute"
          style={{ color: "rgba(0,70,130,0.13)" }}
        />
        <CloudB
          className="cloud cloud-2 w-52 absolute"
          style={{ color: "rgba(0,60,110,0.09)" }}
        />
        <CloudA
          className="cloud cloud-3 w-96 absolute"
          style={{ color: "rgba(0,65,120,0.11)" }}
        />
        <CloudB
          className="cloud cloud-4 w-60 absolute"
          style={{ color: "rgba(0,50,95,0.07)" }}
        />
        <CloudA
          className="cloud cloud-5 w-44 absolute"
          style={{ color: "rgba(0,55,100,0.06)" }}
        />
      </div>

      {/* ── Drone — flies down from above viewport ────────────── */}
      <motion.div
        className="relative z-20 mt-24"
        initial={{ y: -320, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{ willChange: "transform" }}
      >
        {/* Perpetual hover float — starts after fly-in */}
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
          className="relative"
        >
          <div className="w-44 h-44 md:w-56 md:h-56">
            <DroneSVG />
          </div>
          {/* Glow beneath rotors */}
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 h-5 rounded-full blur-2xl pointer-events-none"
            style={{ background: "rgba(0,229,255,0.16)" }}
          />
        </motion.div>
      </motion.div>

      {/* ── Text ──────────────────────────────────────────────── */}
      <div className="relative z-10 text-center px-6 max-w-4xl mt-2">
        <TrueFocus
          sentence="S A L V O"
          blurAmount={6}
          borderColor="#00e5ff"
          animationDuration={0.6}
          pauseBetweenAnimations={1.5}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="mt-6 text-xl md:text-2xl font-light tracking-wide"
          style={{ color: "#00e5ff" }}
        >
          AI-Powered Autonomous Water Rescue
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.8 }}
          className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Spots a person in distress. Tracks them. Deploys a flotation device.
          Pings the nearest lifeguard. All in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#how-it-works"
            className="px-8 py-3 rounded-lg border font-medium transition-all glow-cyan-sm"
            style={{
              background: "rgba(0,229,255,0.07)",
              borderColor: "rgba(0,229,255,0.35)",
              color: "#00e5ff",
            }}
          >
            See How It Works
          </a>
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-lg font-semibold transition-all glow-cyan"
            style={{ background: "#00e5ff", color: "#0a0f1a" }}
          >
            View Dashboard
          </Link>
        </motion.div>
      </div>

      {/* ── Scroll indicator ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span
          className="text-xs font-mono tracking-widest uppercase"
          style={{ color: "rgba(100,130,160,0.6)" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full flex items-start justify-center p-1.5"
          style={{ border: "1px solid rgba(100,130,160,0.35)" }}
        >
          <div
            className="w-1 h-2 rounded-full"
            style={{ background: "#00e5ff" }}
          />
        </motion.div>
      </motion.div>

      {/* Bottom fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to top, #0a0f1a, transparent)" }}
      />
    </section>
  );
}
