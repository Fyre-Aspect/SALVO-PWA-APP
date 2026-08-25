"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import TrueFocus from "@/components/reactbits/TrueFocus";
import { DECK, pageState } from "./droneDeck";

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

const CARD = {
  background: "rgba(0,14,30,0.78)",
  border: "1px solid rgba(0,229,255,0.14)",
  backdropFilter: "blur(14px)",
} as const;

// Hero sits over open blue sky with pale cloud drifting behind it. Light type
// with a deep halo reads over both — the halo is what carries it across the
// cloud edges, so it is deliberately heavy.
const INK = {
  wordmark: "#ffffff",
  tagline:  "#9df6ff",
  body:     "rgba(230,244,255,0.95)",
  faint:    "rgba(214,236,255,0.9)",
} as const;
const HALO =
  "0 2px 14px rgba(2,16,36,0.9), 0 0 42px rgba(0,36,80,0.7), 0 1px 2px rgba(0,0,0,0.45)";

// Sky gradient stops: clear day → late afternoon → dusk → night
const SKY_KEYS = [0, 0.42, 0.68, 0.9];
const SKY_TOP = ["#1663c9", "#1f5ea8", "#12325f", "#040b18"];
const SKY_MID = ["#5aa7e8", "#7ba6cf", "#4c4f80", "#0a1428"];
const SKY_LOW = ["#c9e8fb", "#f0c49b", "#9c5670", "#101c31"];
const SUN_X   = ["20%", "32%", "58%", "76%"];
const SUN_Y   = ["15%", "27%", "58%", "86%"];
const SUN_COL = [
  "rgba(255,253,242,0.9)",
  "rgba(255,240,205,0.85)",
  "rgba(255,146,74,0.72)",
  "rgba(110,58,92,0.2)",
];

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

  // Which page the drone is presenting — only changes when it turns, so this
  // re-renders twice across the whole scroll.
  const [deckIdx, setDeckIdx] = useState(0);
  useEffect(
    () =>
      scrollYProgress.on("change", (v) => {
        const next = pageState(v).index;
        setDeckIdx((prev) => (prev === next ? prev : next));
      }),
    [scrollYProgress],
  );

  const frame = DECK[deckIdx];

  // Progress through the current page's panel scroll, driven outside React
  const pageFill = useTransform(
    scrollYProgress,
    (v) => `${pageState(v).scroll * 100}%`,
  );

  // Section 1 — Hero (0-26%)
  const heroOp = useTransform(scrollYProgress, [0, 0.13, 0.19, 0.26], [1, 1, 1, 0]);
  const heroY  = useTransform(scrollYProgress, [0, 0.26], ["0px", "-50px"]);

  // Section 2 — the deck caption, riding above the drone display (24-93%)
  const deckOp = useTransform(scrollYProgress, [0.24, 0.30, 0.89, 0.93], [0, 1, 1, 0]);
  const deckY  = useTransform(
    scrollYProgress,
    [0.24, 0.30, 0.89, 0.93],
    ["28px", "0px", "0px", "-28px"],
  );

  // Section 3 — CTA (92-100%)
  const ctaOp = useTransform(scrollYProgress, [0.92, 0.97], [0, 1]);

  // Sky — a CSS gradient rather than a shader dome, so day-into-night is
  // exact rather than whatever the tone mapper decides.
  const skyTop = useTransform(scrollYProgress, SKY_KEYS, SKY_TOP);
  const skyMid = useTransform(scrollYProgress, SKY_KEYS, SKY_MID);
  const skyLow = useTransform(scrollYProgress, SKY_KEYS, SKY_LOW);
  const sunX = useTransform(scrollYProgress, SKY_KEYS, SUN_X);
  const sunY = useTransform(scrollYProgress, SKY_KEYS, SUN_Y);
  const sunCol = useTransform(scrollYProgress, SKY_KEYS, SUN_COL);
  const sky = useMotionTemplate`radial-gradient(circle at ${sunX} ${sunY}, ${sunCol} 0%, rgba(255,255,255,0) 46%), linear-gradient(to bottom, ${skyTop} 0%, ${skyMid} 55%, ${skyLow} 100%)`;

  return (
    <>
      {/* ── Sky backdrop, behind the transparent canvas ──────── */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0, backgroundImage: sky }}
      />

      {/* ── Fixed 3D canvas ──────────────────────────────────── */}
      <div className="fixed inset-0" style={{ zIndex: 1 }}>
        <DroneScene scrollYProgress={scrollYProgress} />
      </div>

      {/* ── 700 vh scroll driver ─────────────────────────────── */}
      <div
        ref={containerRef}
        style={{ height: "800vh", position: "relative", zIndex: 10 }}
      >
        {/* The deck renders on the WebGL drone display — mirror it in the
            document so assistive tech and crawlers get the same copy. */}
        <div className="sr-only">
          {DECK.map((page, i) => (
            <section key={i} aria-label={page.heading}>
              <h2>{page.heading}</h2>
              <p>{page.sub}</p>
              {page.blocks.map((b, j) => {
                switch (b.kind) {
                  case "step":
                    return (
                      <div key={j}>
                        <h3>{b.title}</h3>
                        <p>{b.text}</p>
                      </div>
                    );
                  case "para":
                    return <p key={j}>{b.text}</p>;
                  case "subhead":
                    return <h3 key={j}>{b.text}</h3>;
                  case "table":
                    return (
                      <dl key={j}>
                        {b.rows.map((row) => (
                          <div key={row.k}>
                            <dt>{row.k}</dt>
                            <dd>{row.v}</dd>
                          </div>
                        ))}
                      </dl>
                    );
                  case "stats":
                    return (
                      <ul key={j}>
                        {b.items.map((s) => (
                          <li key={s.label}>{`${s.label}: ${s.val}`}</li>
                        ))}
                      </ul>
                    );
                  case "chips":
                    return (
                      <ul key={j}>
                        {b.items.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    );
                }
              })}
            </section>
          ))}
        </div>

        {/* All sections share the same fixed viewport, swapping via opacity */}
        <div
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 20 }}
        >

          {/* ─── SECTION 1 — HERO ───────────────────────────── */}
          {/* Anchored to the top so the drone flies clear beneath it */}
          <motion.div
            style={{ opacity: heroOp, y: heroY }}
            className="absolute inset-0 flex flex-col items-center justify-start px-6 pt-[6vh] pointer-events-auto"
          >
            <TrueFocus
              sentence="S A L V O"
              blurAmount={6}
              borderColor="#00e5ff"
              animationDuration={0.6}
              pauseBetweenAnimations={1.5}
              color={INK.wordmark}
              textShadow={HALO}
              dimOpacity={0.82}
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.8 }}
              className="mt-6 text-xl md:text-2xl font-semibold tracking-wide"
              style={{ color: INK.tagline, textShadow: HALO }}
            >
              AI-Powered Autonomous Water Rescue
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.8 }}
              className="mt-4 text-lg max-w-2xl mx-auto text-center leading-relaxed"
              style={{ color: INK.body, textShadow: HALO }}
            >
              Spots a person in distress. Tracks them. Deploys a flotation
              device. Pings the nearest lifeguard. All in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="mt-9 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() =>
                  window.scrollBy({ top: window.innerHeight * 1.5, behavior: "smooth" })
                }
                className="px-8 py-3 rounded-lg border font-semibold cursor-pointer transition-all"
                style={{
                  background: "rgba(4,20,42,0.42)",
                  borderColor: "rgba(160,240,255,0.55)",
                  color: "#ffffff",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 6px 22px rgba(2,16,36,0.35)",
                }}
              >
                See How It Works ↓
              </button>
              <Link
                href="/dashboard"
                className="px-8 py-3 rounded-lg font-bold transition-all"
                style={{
                  background: "#00e5ff",
                  color: "#04121f",
                  boxShadow: "0 6px 26px rgba(0,120,170,0.45)",
                }}
              >
                View Dashboard
              </Link>
            </motion.div>

            {/* Scroll cue */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
            >
              <motion.span
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs font-tech tracking-widest uppercase"
                style={{ color: INK.faint, textShadow: HALO }}
              >
                Scroll to fly
              </motion.span>
              <div
                className="w-5 h-8 rounded-full flex items-start justify-center p-1.5"
                style={{
                  border: "1px solid rgba(220,244,255,0.55)",
                  boxShadow: "0 2px 10px rgba(2,16,36,0.4)",
                }}
              >
                <motion.div
                  className="w-1 h-2 rounded-full"
                  style={{ background: "#9df6ff" }}
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* ─── SECTION 2 — DECK CAPTION ───────────────────── */}
          {/* Body copy lives on the drone's display; this labels what's on it */}
          <motion.div
            style={{ opacity: deckOp, y: deckY }}
            className="absolute inset-0 flex flex-col items-center justify-start px-6 pt-[5vh] pointer-events-auto"
            aria-hidden="true"
          >
            <div className="w-full max-w-lg rounded-2xl px-6 py-5" style={CARD}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={deckIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <p
                    className="text-xs font-tech tracking-[0.35em] uppercase text-center mb-2"
                    style={{ color: "#00e5ff" }}
                  >
                    {frame.tag}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-1.5">
                    {frame.heading}
                  </h2>
                  <p
                    className="text-center text-sm"
                    style={{ color: "rgba(180,210,240,0.6)" }}
                  >
                    {frame.sub}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* One segment per page; the active one fills as its panel scrolls */}
              <div className="flex items-start gap-2 mt-5">
                {DECK.map((f, i) => (
                  <div key={f.tag} className="flex-1 text-center">
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{
                        background:
                          i < deckIdx ? "#00e5ff" : "rgba(0,229,255,0.18)",
                        boxShadow: i === deckIdx ? "0 0 8px #00e5ff" : "none",
                      }}
                    >
                      {i === deckIdx && (
                        <motion.div
                          className="h-full rounded-full"
                          style={{ width: pageFill, background: "#00e5ff" }}
                        />
                      )}
                    </div>
                    <span
                      className="mt-2 block text-[10px] font-tech tracking-widest uppercase transition-colors duration-300"
                      style={{
                        color:
                          i === deckIdx ? "#00e5ff" : "rgba(140,180,215,0.5)",
                      }}
                    >
                      {f.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─── SECTION 3 — CTA ────────────────────────────── */}
          <motion.div
            style={{ opacity: ctaOp }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-auto"
          >
            <div className="text-center max-w-xl">
              <span
                className="inline-block text-xs font-tech tracking-[0.3em] uppercase px-4 py-1.5 rounded-full mb-6"
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

        {/* ── Deck progress dots (right rail) ─────────────────── */}
        <div
          className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-none"
          style={{ zIndex: 30 }}
        >
          {[0.10, 0.44, 0.70, 0.85, 0.96].map((anchor, i) => (
            <ScrollDot key={i} anchor={anchor} scrollYProgress={scrollYProgress} />
          ))}
        </div>

      </div>{/* /scroll driver */}
    </>
  );
}
