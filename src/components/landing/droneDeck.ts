import { features } from "@/data/mock";

/**
 * The landing page's body copy lives on the drone-mounted displays rather than
 * in overlay cards. Single source of truth for what the screens show and when —
 * consumed by DroneScene (canvas textures) and ScrollLanding (caption bar +
 * screen-reader copy) so they never drift apart.
 *
 * Two levels of motion:
 *   • between pages — the whole airframe turns a quarter revolution, bringing
 *     the next face (and the next page) round to the camera;
 *   • within a page — the airframe holds dead still and only the panel's body
 *     region scrolls, panning down that page's content.
 */

// Scroll window over which the deck plays, start to finish.
export const DECK_START = 0.30;
export const DECK_END = 0.90;

/** Number of display faces on the airframe. Page i lives on face (i+1) % FACES. */
export const FACES = 4;

/**
 * Progress spent on each half of a page-to-page turn. Absolute (not a fraction
 * of a page) so every turn takes the same time even though pages differ in
 * length — otherwise the rotation visibly changes speed at each boundary.
 */
export const TURN_P = 0.03;

export type PageBlock =
  | { kind: "step"; seq: string; title: string; text: string }
  | { kind: "para"; text: string }
  | { kind: "table"; rows: { k: string; v: string }[] }
  | { kind: "stats"; items: { val: string; label: string }[] }
  | { kind: "subhead"; text: string }
  | { kind: "chips"; items: string[] };

export type DeckPage = {
  /** Header strip on the display */
  eyebrow: string;
  /** Marker under the header strip */
  seq: string;
  /** Panel title, above the scrolling body region */
  title: string;
  /** DOM caption */
  heading: string;
  sub: string;
  tag: string;
  /** Relative scroll distance — roughly proportional to content height */
  weight: number;
  blocks: PageBlock[];
};

export const DECK: DeckPage[] = [
  {
    eyebrow: "SALVO // HOW IT WORKS",
    seq: "SEQUENCE 01 / 03",
    title: "HOW IT WORKS",
    heading: "From Detection to Deployment",
    sub: "Under 30 seconds — streaming live to the onboard display.",
    tag: "Sequence",
    weight: 880,
    blocks: features.map((f, i) => ({
      kind: "step" as const,
      seq: `STEP ${String(i + 1).padStart(2, "0")} / ${String(features.length).padStart(2, "0")}`,
      title: f.title.toUpperCase(),
      text: f.desc,
    })),
  },
  {
    eyebrow: "SALVO // EDGE STACK",
    seq: "SEQUENCE 02 / 03",
    title: "EDGE STACK",
    heading: "Real-Time AI. No Cloud.",
    sub: "Full inference on-board. Millisecond response.",
    tag: "Stack",
    weight: 452,
    blocks: [
      {
        kind: "para",
        text: "Every frame is scored on the airframe. No uplink, no round trip, no dead zone.",
      },
      {
        kind: "table",
        rows: [
          { k: "COMPUTE", v: "Jetson Orin Nano" },
          { k: "THERMAL", v: "FLIR Lepton 3.5" },
          { k: "RGB", v: "1080p wide @ 30fps" },
          { k: "CONTROL", v: "ESP32 servo + winch" },
          { k: "PAYLOAD", v: "250–500 g" },
          { k: "THROW", v: "5–10 m" },
          { k: "TETHER", v: "15–30 m" },
          { k: "LINK", v: "Wi-Fi stream, LTE ready" },
        ],
      },
    ],
  },
  {
    eyebrow: "SALVO // RESCUE ARM",
    seq: "SEQUENCE 03 / 03",
    title: "RESCUE ARM",
    heading: "Mounted. Aimed. Deployed.",
    sub: "Servo-driven catapult, winch spool, tethered flotation device.",
    tag: "Arm",
    weight: 376,
    blocks: [
      {
        kind: "para",
        text: "A universal mount fits any drone frame. The arm aims, fires, and pays out line.",
      },
      {
        kind: "stats",
        items: [
          { val: "250–500g", label: "PAYLOAD MASS" },
          { val: "5–10m", label: "THROW RANGE" },
          { val: "15–30m", label: "TETHER LENGTH" },
        ],
      },
      { kind: "subhead", text: "SAFETY INTERLOCKS" },
      {
        kind: "chips",
        items: [
          "Dual-stage arming",
          "Physical interlock",
          "Software interlock",
          "Abort on link loss",
        ],
      },
    ],
  },
];

/** Absolute progress at each page boundary — length DECK.length + 1. */
export const PAGE_BOUNDS: number[] = (() => {
  const total = DECK.reduce((sum, page) => sum + page.weight, 0);
  const span = DECK_END - DECK_START;
  const bounds = [DECK_START];
  let acc = 0;
  for (const page of DECK) {
    acc += page.weight;
    bounds.push(DECK_START + (acc / total) * span);
  }
  return bounds;
})();

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export type PageState = {
  /** Index of the page currently presented */
  index: number;
  /** 0 → 1 as the panel body pans through this page's content */
  scroll: number;
};

export function pageState(p: number): PageState {
  const last = DECK.length - 1;
  let index = 0;
  while (index < last && p >= PAGE_BOUNDS[index + 1]) index++;

  const start = PAGE_BOUNDS[index];
  const end = PAGE_BOUNDS[index + 1];
  // The turn out of a page eats into its tail — except for the last page,
  // which holds square-on right up to DECK_END.
  const holdStart = start + TURN_P;
  const holdEnd = index === last ? end : end - TURN_P;

  const scroll =
    holdEnd > holdStart ? clamp01((p - holdStart) / (holdEnd - holdStart)) : 0;

  return { index, scroll };
}

/** Where page `i` sits relative to the page currently on screen. */
export function pageScrollFor(p: number, i: number) {
  const { index, scroll } = pageState(p);
  if (i === index) return scroll;
  return i < index ? 1 : 0;
}
