"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import TrueFocus from "@/components/reactbits/TrueFocus";
import { features, specs } from "@/data/mock";

// Three.js canvas — client-only, code-split out of the main bundle
const DroneScene = dynamic(() => import("./DroneScene"), {
  ssr: false,
  loading: () => (
    <div
      className="fixed inset-0"
      style={{ background: "linear-gradient(to bottom, #1a6acc 0%, #0a2550 100%)" }}
    />
  ),
});

const ICON_PATHS: Record<string, string> = {
  radar:
    "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  crosshair:
    "M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-5.07l-2.83 2.83M9.76 14.24l-2.83 2.83m0-10.14l2.83 2.83m4.48 4.48l2.83 2.83",
  alert:
    "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  deploy:
    "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 2v2m8-2v2m-4-2v2M3 12h18M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
};

const CARD = {
  background: "rgba(0,14,30,0.78)",
  border: "1px solid rgba(0,229,255,0.14)",
  backdropFilter: "blur(14px)",
} as const;

// ── Section progress dots ─────────────────────────────────────────
function ScrollDot({
  anchor,
  scrollYProgress,
}: {
  anchor: number;
  scrollYProgress: MotionValue<number>;
}) {
  const opacity = useTransform(
    scrollYProgress,
    [anchor - 0.12, anchor, anchor + 0.12],
    [0.25, 1, 0.25],
  );
  const scale = useTransform(
    scrollYProgress,
    [anchor - 0.12, anchor, anchor + 0.12],
    [0.6, 1.4, 0.6],
  );
  return (
    <motion.div
      className="w-1.5 h-1.5 rounded-full"
      style={{
        opacity,
        scale,
        background: "#00e5ff",
        boxShadow: "0 0 6px #00e5ff",
      }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────
export default function ScrollLanding() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Section 1 — Hero (0-26%)
  const heroOp = useTransform(scrollYProgress, [0, 0.13, 0.19, 0.26], [1, 1, 1, 0]);
  const heroY  = useTransform(scrollYProgress, [0, 0.26], ["0px", "-50px"]);

  // Section 2 — How It Works (23-51%)
  const howOp = useTransform(scrollYProgress, [0.23, 0.30, 0.44, 0.51], [0, 1, 1, 0]);
  const howY  = useTransform(
    scrollYProgress,
    [0.23, 0.30, 0.44, 0.51],
    ["32px", "0px", "0px", "-32px"],
  );

  // Section 3 — Tech Specs (49-75%)
  const techOp = useTransform(scrollYProgress, [0.49, 0.56, 0.68, 0.75], [0, 1, 1, 0]);
  const techY  = useTransform(
    scrollYProgress,
    [0.49, 0.56, 0.68, 0.75],
    ["32px", "0px", "0px", "-32px"],
  );

  // Section 4 — Product Showcase (73-95%)
  const showOp = useTransform(scrollYProgress, [0.73, 0.80, 0.89, 0.95], [0, 1, 1, 0]);
  const showY  = useTransform(
    scrollYProgress,
    [0.73, 0.80, 0.89, 0.95],
    ["32px", "0px", "0px", "-32px"],
  );

  // Section 5 — CTA (93-100%)
  const ctaOp = useTransform(scrollYProgress, [0.93, 0.98], [0, 1]);

  // Night fade overlay
  const nightOp = useTransform(scrollYProgress, [0.46, 0.80], [0, 0.75]);

  return (
    <>
      {/* ── Fixed 3D canvas ──────────────────────────────────── */}
      <div className="fixed inset-0 z-0">
        <DroneScene scrollYProgress={scrollYProgress} />
      </div>

      {/* ── Dusk/night overlay (CSS — zero JS cost) ──────────── */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          opacity: nightOp,
          background: "linear-gradient(to bottom, #000811, #020c1a)",
        }}
      />

      {/* ── 700 vh scroll driver ─────────────────────────────── */}
      <div
        ref={containerRef}
        style={{ height: "700vh", position: "relative", zIndex: 10 }}
      >
        {/* All sections share the same fixed viewport, swapping via opacity */}
        <div
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 20 }}
        >

          {/* ─── SECTION 1 — HERO ───────────────────────────── */}
          <motion.div
            style={{ opacity: heroOp, y: heroY }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-auto"
          >
            <TrueFocus
              sentence="S A L V O"
              blurAmount={6}
              borderColor="#00e5ff"
              animationDuration={0.6}
              pauseBetweenAnimations={1.5}
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.8 }}
              className="mt-6 text-xl md:text-2xl font-light tracking-wide"
              style={{ color: "#00e5ff" }}
            >
              AI-Powered Autonomous Water Rescue
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.8 }}
              className="mt-4 text-lg max-w-2xl mx-auto text-center leading-relaxed"
              style={{ color: "rgba(200,225,245,0.72)" }}
            >
              Spots a person in distress. Tracks them. Deploys a flotation
              device. Pings the nearest lifeguard. All in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() =>
                  window.scrollBy({ top: window.innerHeight * 1.5, behavior: "smooth" })
                }
                className="px-8 py-3 rounded-lg border font-medium cursor-pointer transition-all"
                style={{
                  background: "rgba(0,229,255,0.07)",
                  borderColor: "rgba(0,229,255,0.36)",
                  color: "#00e5ff",
                }}
              >
                See How It Works ↓
              </button>
              <Link
                href="/dashboard"
                className="px-8 py-3 rounded-lg font-semibold transition-all"
                style={{ background: "#00e5ff", color: "#0a0f1a" }}
              >
                View Dashboard
              </Link>
            </motion.div>

            {/* Scroll cue */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 1 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
            >
              <motion.span
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs font-mono tracking-widest uppercase"
                style={{ color: "rgba(100,160,200,0.65)" }}
              >
                Scroll to fly
              </motion.span>
              <div
                className="w-5 h-8 rounded-full flex items-start justify-center p-1.5"
                style={{ border: "1px solid rgba(100,160,200,0.3)" }}
              >
                <motion.div
                  className="w-1 h-2 rounded-full"
                  style={{ background: "#00e5ff" }}
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* ─── SECTION 2 — HOW IT WORKS ───────────────────── */}
          <motion.div
            style={{ opacity: howOp, y: howY }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-auto"
          >
            <div className="max-w-4xl w-full">
              <p
                className="text-xs font-mono tracking-[0.3em] uppercase text-center mb-2"
                style={{ color: "#00e5ff" }}
              >
                How It Works
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-2">
                From Detection to Deployment
              </h2>
              <p
                className="text-center text-sm mb-8"
                style={{ color: "rgba(180,210,240,0.55)" }}
              >
                Under 30 seconds. Every second counts.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {features.map((f, i) => (
                  <div key={f.title} className="rounded-2xl p-5" style={CARD}>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{
                        background: "rgba(0,229,255,0.1)",
                        border: "1px solid rgba(0,229,255,0.22)",
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        style={{ color: "#00e5ff" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={ICON_PATHS[f.icon]}
                        />
                      </svg>
                    </div>
                    <div
                      className="text-[10px] font-mono mb-1"
                      style={{ color: "rgba(0,229,255,0.45)" }}
                    >
                      STEP {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">
                      {f.title}
                    </h3>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "rgba(190,215,240,0.62)" }}
                    >
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─── SECTION 3 — TECH SPECS ─────────────────────── */}
          <motion.div
            style={{ opacity: techOp, y: techY }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-auto"
          >
            <div className="max-w-3xl w-full">
              <p
                className="text-xs font-mono tracking-[0.3em] uppercase text-center mb-2"
                style={{ color: "#00e5ff" }}
              >
                Built for the Edge
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-2">
                Real-Time AI. No Cloud.
              </h2>
              <p
                className="text-center text-sm mb-8"
                style={{ color: "rgba(180,210,240,0.55)" }}
              >
                Full inference on-board. Millisecond response.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {specs.map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={CARD}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: "#00e5ff",
                        boxShadow: "0 0 5px #00e5ff",
                      }}
                    />
                    <span
                      className="text-sm font-mono"
                      style={{ color: "rgba(190,220,255,0.82)" }}
                    >
                      {spec}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─── SECTION 4 — PRODUCT SHOWCASE ───────────────── */}
          <motion.div
            style={{ opacity: showOp, y: showY }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-auto"
          >
            <div className="max-w-2xl w-full text-center">
              <p
                className="text-xs font-mono tracking-[0.3em] uppercase mb-2"
                style={{ color: "#00e5ff" }}
              >
                The Rescue Arm
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Mounted. Aimed. Deployed.
              </h2>
              <p
                className="mb-8 leading-relaxed max-w-lg mx-auto"
                style={{ color: "rgba(180,210,240,0.65)" }}
              >
                A servo-driven catapult with a winch spool and tethered
                flotation device. Universal mount fits any drone frame.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { val: "250–500g", label: "Payload Mass"  },
                  { val: "5–10m",    label: "Throw Range"   },
                  { val: "15–30m",   label: "Tether Length" },
                ].map(({ val, label }) => (
                  <div key={label} className="rounded-2xl p-4" style={CARD}>
                    <div
                      className="text-2xl font-mono font-bold"
                      style={{ color: "#00e5ff" }}
                    >
                      {val}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: "rgba(150,180,210,0.65)" }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Dual-Stage Arming",
                  "Physical + Software Safety",
                  "Universal Drone Mount",
                ].map((badge) => (
                  <span
                    key={badge}
                    className="text-xs font-mono px-3 py-1 rounded-full"
                    style={{
                      background: "rgba(0,229,255,0.08)",
                      border: "1px solid rgba(0,229,255,0.2)",
                      color: "rgba(0,229,255,0.8)",
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─── SECTION 5 — CTA ────────────────────────────── */}
          <motion.div
            style={{ opacity: ctaOp }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-auto"
          >
            <div className="text-center max-w-xl">
              <span
                className="inline-block text-xs font-mono tracking-[0.3em] uppercase px-4 py-1.5 rounded-full mb-6"
                style={{
                  background: "rgba(0,229,255,0.08)",
                  border: "1px solid rgba(0,229,255,0.25)",
                  color: "#00e5ff",
                }}
              >
                Ready to Launch
              </span>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Lives Can&apos;t Wait.
              </h2>
              <p
                className="text-lg mb-10 leading-relaxed"
                style={{ color: "rgba(180,210,240,0.65)" }}
              >
                Access the SALVO command dashboard and monitor AI-powered
                rescue deployments in real time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-10 py-4 rounded-xl text-lg font-bold transition-all"
                  style={{
                    background: "#00e5ff",
                    color: "#0a0f1a",
                    boxShadow:
                      "0 0 30px rgba(0,229,255,0.35), 0 0 80px rgba(0,229,255,0.12)",
                  }}
                >
                  Launch Dashboard →
                </Link>
                <Link
                  href="/auth?mode=register"
                  className="px-10 py-4 rounded-xl text-lg font-medium border transition-all"
                  style={{
                    borderColor: "rgba(0,229,255,0.32)",
                    color: "#00e5ff",
                    background: "rgba(0,229,255,0.06)",
                  }}
                >
                  Create Account
                </Link>
              </div>
            </div>
          </motion.div>

        </div>{/* /fixed overlay */}

        {/* ── Section progress dots (right rail) ──────────────── */}
        <div
          className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-none"
          style={{ zIndex: 30 }}
        >
          {[0.1, 0.37, 0.62, 0.84, 0.96].map((anchor, i) => (
            <ScrollDot key={i} anchor={anchor} scrollYProgress={scrollYProgress} />
          ))}
        </div>

      </div>{/* /scroll driver */}
    </>
  );
}
