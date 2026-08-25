"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import {
  DECK,
  DECK_START,
  DECK_END,
  FACES,
  PAGE_BOUNDS,
  TURN_P,
  pageScrollFor,
  type DeckPage,
  type PageBlock,
} from "./droneDeck";

const L = THREE.MathUtils.lerp;

function smooth01(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

/**
 * Multi-stop keyframe track with smoothstep easing between stops.
 * `stops` must be ascending and the same length as `values`.
 */
function track(p: number, stops: number[], values: number[]) {
  const last = stops.length - 1;
  if (p <= stops[0]) return values[0];
  if (p >= stops[last]) return values[last];
  for (let i = 0; i < last; i++) {
    if (p <= stops[i + 1]) {
      const t = (p - stops[i]) / (stops[i + 1] - stops[i]);
      return L(values[i], values[i + 1], t * t * (3 - 2 * t));
    }
  }
  return values[last];
}

// ── Drone flight, scrubbed to scroll progress ────────────────────
// The airframe only ever moves between pages: it falls back, turns a quarter
// revolution to bring the next face round, and comes forward again. For the
// whole of a page it holds dead still — the panel scrolls instead.
const N = DECK.length;

const NEAR_Z =  2.30, NEAR_S = 2.05;   // square-on, readable
const FAR_Z  = -2.20, FAR_S  = 0.85;   // pulled back mid-turn
const HERO_Z = -3.50, HERO_S = 0.70;
const OUT_Z  = -3.20, OUT_S  = 0.80;

// How far below the camera's aim the presented face sits, as a tangent
const HERO_DROP = 0.174;   // low, well clear of the headline
const DECK_DROP = 0.0454;  // just under centre
const OUT_DROP  = 0.130;   // sunk behind the closing CTA

const LEAD_IN_START = 0.19;
const OUTRO_END = 0.97;

// Past this the last page has been read, so the airframe stops holding station
const POSE_END = DECK_END - TURN_P;

function dronePose(p: number) {
  // Freeze the pose input at the end of the last page's hold, so the drone
  // never begins a turn it has no page to turn towards.
  const q = Math.min(p, POSE_END);

  let i = 0;
  while (i < N - 1 && q >= PAGE_BOUNDS[i + 1]) i++;
  const dPrev = q - PAGE_BOUNDS[i];
  const dNext = PAGE_BOUNDS[i + 1] - q;

  // 0 at a page boundary (far, mid-turn), 1 anywhere inside a page
  const closeness = smooth01(Math.min(dPrev, dNext) / TURN_P);

  // Quarter-turn staircase. Page i is presented at yaw 90°·(i+1), so face
  // (i+1) % FACES is the one square-on to the camera.
  let turns = i + 1;
  let r = 0;
  if (dNext < TURN_P) {
    r = (TURN_P - dNext) / (2 * TURN_P);        // turning out of page i
  } else if (dPrev < TURN_P) {
    turns = i;
    r = 0.5 + dPrev / (2 * TURN_P);             // turning into page i
  }
  const deckYaw = (Math.PI / 2) * (turns + smooth01(r));

  let z = L(FAR_Z, NEAR_Z, closeness);
  let s = L(FAR_S, NEAR_S, closeness);
  let drop = DECK_DROP;

  // Lead-in from the hero pose (yaw is already handled by the turn staircase,
  // which reads 0 until a half-turn before the first page)
  const w = smooth01((p - LEAD_IN_START) / (DECK_START - LEAD_IN_START));
  if (w < 1) {
    z = L(HERO_Z, z, w);
    s = L(HERO_S, s, w);
    drop = L(HERO_DROP, DECK_DROP, w);
  }

  // Outro behind the closing call to action
  const o = smooth01((p - DECK_END) / (OUTRO_END - DECK_END));
  if (o > 0) {
    z = L(z, OUT_Z, o);
    s = L(s, OUT_S, o);
    drop = L(drop, OUT_DROP, o);
  }

  return { z, s, yaw: deckYaw, drop };
}

// Displays power up as the first face rotates in, power down after the deck
const SCREEN_FADE_STOPS  = [0, 0.20, 0.28, 0.90, 0.95];
const SCREEN_FADE_VALUES = [0, 0, 1, 1, 0];

// ── Procedural Drone ─────────────────────────────────────────────
// Motors sit far enough out that the prop discs clear the four display
// housings mounted at ±0.95 on each axis.
const MOTOR_XZ: [number, number][] = [
  [-1.25, -1.25],
  [ 1.25, -1.25],
  [-1.25,  1.25],
  [ 1.25,  1.25],
];
const MOTOR_Y = 0.14;
const PROP_R = 0.6;

// ── Drone-mounted display ────────────────────────────────────────
// Two canvases per panel. The chrome is fixed furniture — header, title,
// progress, telemetry. The body is a tall canvas the panel pans down through
// as you scroll within a page, exposed by a window cut into the chrome.
const TEX_W = 704;
const TEX_H = 480;
const TEX_SS = 1.5;

// Body window in chrome design coordinates
const WIN_X = 26;
const WIN_Y = 128;
const WIN_W = TEX_W - 52;
const WIN_H = 282;

// The body canvas itself: same width, tall enough for the longest page
const BODY_W = WIN_W;
const BODY_H = 960;

function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  startSize: number,
  maxWidth: number,
  minSize = 14,
) {
  let size = startSize;
  ctx.font = `${size}px ${family}`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function panelBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  gridFrom = 0,
) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#02182b");
  bg.addColorStop(1, "#01243c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(0,229,255,0.09)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = gridFrom; y <= h; y += 44) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function scanlines(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "rgba(0,0,0,0.17)";
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);
}

/** Fixed panel furniture. The body window is left as bare backdrop. */
function drawChrome(
  ctx: CanvasRenderingContext2D,
  page: DeckPage,
  index: number,
  family: string,
) {
  const f = (size: number) => `${size}px ${family}`;

  panelBackdrop(ctx, TEX_W, TEX_H);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  // Header strip
  ctx.fillStyle = "rgba(0,229,255,0.16)";
  ctx.fillRect(0, 0, TEX_W, 50);
  ctx.font = f(fitFont(ctx, page.eyebrow, family, 22, TEX_W - 150));
  ctx.fillStyle = "#8ff2ff";
  ctx.fillText(page.eyebrow, 24, 26);
  ctx.fillStyle = "#ff4d4d";
  ctx.beginPath();
  ctx.arc(TEX_W - 100, 25, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = f(21);
  ctx.fillStyle = "#a6ecff";
  ctx.fillText("LIVE", TEX_W - 86, 26);

  // Sequence marker + title
  ctx.font = f(18);
  ctx.fillStyle = "rgba(0,229,255,0.72)";
  ctx.fillText(page.seq, 26, 72);

  ctx.font = f(fitFont(ctx, page.title, family, 36, TEX_W - 52, 22));
  ctx.fillStyle = "#e9fcff";
  ctx.shadowColor = "rgba(0,229,255,0.95)";
  ctx.shadowBlur = 24;
  ctx.fillText(page.title, 24, 104);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(0,229,255,0.38)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, 122);
  ctx.lineTo(TEX_W - 24, 122);
  ctx.stroke();

  // Page progress segments
  const gap = 6;
  const segW = (TEX_W - 52 - gap * (N - 1)) / N;
  for (let i = 0; i < N; i++) {
    ctx.fillStyle = i <= index ? "#00e5ff" : "rgba(0,229,255,0.18)";
    ctx.fillRect(26 + i * (segW + gap), TEX_H - 60, segW, 8);
  }

  // Telemetry footer
  ctx.font = f(19);
  ctx.fillStyle = "rgba(126,204,238,0.72)";
  ctx.fillText("ALT 12.4m   BAT 87%   LINK OK   CONF 0.94", 26, TEX_H - 26);

  // Corner brackets
  ctx.strokeStyle = "rgba(0,229,255,0.7)";
  ctx.lineWidth = 3;
  const b = 24;
  ([
    [10, 60, 1, 1],
    [TEX_W - 10, 60, -1, 1],
    [10, TEX_H - 10, 1, -1],
    [TEX_W - 10, TEX_H - 10, -1, -1],
  ] as [number, number, number, number][]).forEach(([x, y, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(x + sx * b, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + sy * b);
    ctx.stroke();
  });

  scanlines(ctx, TEX_W, TEX_H);

  ctx.strokeStyle = "rgba(0,229,255,0.55)";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, TEX_W - 4, TEX_H - 4);
}

/**
 * The scrolling half of a panel. Lays blocks out top-down and returns the
 * content height so the caller knows how far the window can pan.
 */
function drawBody(
  ctx: CanvasRenderingContext2D,
  page: DeckPage,
  family: string,
) {
  const f = (size: number) => `${size}px ${family}`;
  const PAD = 22;
  const inner = BODY_W - PAD * 2;

  panelBackdrop(ctx, BODY_W, BODY_H);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  let y = 18;

  const block = (b: PageBlock) => {
    switch (b.kind) {
      case "step": {
        ctx.font = f(18);
        ctx.fillStyle = "rgba(0,229,255,0.72)";
        ctx.fillText(b.seq, PAD, y + 12);

        ctx.font = f(fitFont(ctx, b.title, family, 44, inner, 26));
        ctx.fillStyle = "#e9fcff";
        ctx.shadowColor = "rgba(0,229,255,0.85)";
        ctx.shadowBlur = 20;
        ctx.fillText(b.title, PAD, y + 52);
        ctx.shadowBlur = 0;

        ctx.font = f(21);
        ctx.fillStyle = "rgba(186,234,255,0.94)";
        const lines = wrapText(ctx, b.text, inner);
        lines.forEach((line, i) => ctx.fillText(line, PAD, y + 92 + i * 28));
        y += 92 + lines.length * 28 + 14;

        ctx.strokeStyle = "rgba(0,229,255,0.16)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD, y);
        ctx.lineTo(BODY_W - PAD, y);
        ctx.stroke();
        y += 20;
        break;
      }
      case "para": {
        ctx.font = f(21);
        ctx.fillStyle = "rgba(186,234,255,0.9)";
        const lines = wrapText(ctx, b.text, inner);
        lines.forEach((line, i) => ctx.fillText(line, PAD, y + 14 + i * 28));
        y += 14 + lines.length * 28 + 14;
        break;
      }
      case "table": {
        const rowH = 38;
        b.rows.forEach((row, i) => {
          const ry = y + rowH / 2;
          if (i % 2 === 0) {
            ctx.fillStyle = "rgba(0,229,255,0.05)";
            ctx.fillRect(PAD - 6, y + 2, inner + 12, rowH - 4);
          }
          ctx.font = f(18);
          ctx.fillStyle = "rgba(0,229,255,0.66)";
          ctx.fillText(row.k, PAD + 4, ry);
          ctx.font = f(fitFont(ctx, row.v, family, 21, inner - 176, 14));
          ctx.fillStyle = "rgba(196,238,255,0.95)";
          ctx.fillText(row.v, PAD + 168, ry);
          y += rowH;
        });
        y += 14;
        break;
      }
      case "stats": {
        const gap = 12;
        const tileW = (inner - gap * (b.items.length - 1)) / b.items.length;
        const tileH = 104;
        b.items.forEach((s, i) => {
          const x = PAD + i * (tileW + gap);
          ctx.fillStyle = "rgba(0,229,255,0.07)";
          ctx.fillRect(x, y, tileW, tileH);
          ctx.strokeStyle = "rgba(0,229,255,0.28)";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, tileW, tileH);

          ctx.textAlign = "center";
          ctx.font = f(fitFont(ctx, s.val, family, 30, tileW - 18, 18));
          ctx.fillStyle = "#7fefff";
          ctx.fillText(s.val, x + tileW / 2, y + 40);
          ctx.font = f(fitFont(ctx, s.label, family, 14, tileW - 14, 10));
          ctx.fillStyle = "rgba(150,205,235,0.8)";
          ctx.fillText(s.label, x + tileW / 2, y + 74);
          ctx.textAlign = "left";
        });
        y += tileH + 20;
        break;
      }
      case "subhead": {
        ctx.font = f(18);
        ctx.fillStyle = "rgba(0,229,255,0.75)";
        ctx.fillText(b.text, PAD, y + 12);
        y += 24;
        ctx.strokeStyle = "rgba(0,229,255,0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD, y);
        ctx.lineTo(BODY_W - PAD, y);
        ctx.stroke();
        y += 14;
        break;
      }
      case "chips": {
        const rowH = 38;
        b.items.forEach((item) => {
          const cy = y + rowH / 2;
          ctx.fillStyle = "#00e5ff";
          ctx.beginPath();
          ctx.arc(PAD + 6, cy, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = f(fitFont(ctx, item, family, 20, inner - 30, 14));
          ctx.fillStyle = "rgba(186,234,255,0.92)";
          ctx.fillText(item, PAD + 22, cy);
          y += rowH;
        });
        y += 10;
        break;
      }
    }
  };

  page.blocks.forEach(block);
  scanlines(ctx, BODY_W, BODY_H);

  return Math.min(y, BODY_H);
}

// Panel geometry, in airframe units. The panel plane faces local -X; the
// wrapping group rotates it onto whichever face it belongs to.
const PANEL_W = 1.1;
const PANEL_H = 0.75;
const BODY_QUAD_W = (WIN_W / TEX_W) * PANEL_W;
const BODY_QUAD_H = (WIN_H / TEX_H) * PANEL_H;
// Window centre offset from the panel centre, in panel units (canvas Y is down)
const BODY_QUAD_Y = PANEL_H * (0.5 - (WIN_Y + WIN_H / 2) / TEX_H);

/**
 * One display assembly, built facing local -X. The chrome sits behind; the
 * body quad floats a hair in front of it, inside the window the chrome leaves.
 */
function ScreenPanel({
  chrome,
  body,
  onMaterial,
  scrollBarRef,
}: {
  chrome: THREE.CanvasTexture;
  body: THREE.CanvasTexture;
  onMaterial: (m: THREE.MeshBasicMaterial | null) => void;
  scrollBarRef: (m: THREE.Mesh | null) => void;
}) {
  return (
    <group position={[-0.95, 0, 0]}>
      {/* Housing */}
      <mesh>
        <boxGeometry args={[0.06, 0.86, 1.22]} />
        <meshStandardMaterial
          color="#060f1c"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Bezel glow */}
      <mesh position={[-0.032, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.16, 0.81]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.28}
          toneMapped={false}
        />
      </mesh>

      {/* Fixed chrome */}
      <mesh position={[-0.038, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshBasicMaterial
          ref={onMaterial}
          map={chrome}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>

      {/* Scrolling body, windowed into the chrome */}
      <mesh
        position={[-0.044, BODY_QUAD_Y, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[BODY_QUAD_W, BODY_QUAD_H]} />
        <meshBasicMaterial
          ref={onMaterial}
          map={body}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>

      {/* Scroll position indicator down the right edge of the window */}
      <mesh
        ref={scrollBarRef}
        position={[-0.046, BODY_QUAD_Y, -BODY_QUAD_W / 2 - 0.018]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[0.012, BODY_QUAD_H]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>

      {/* Mounting booms back to the airframe */}
      {[-0.3, 0.3].map((z) => (
        <mesh key={z} position={[0.25, 0, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.46, 6]} />
          <meshStandardMaterial color="#0d1a2a" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * One display per page, each bolted to its own face: page i lives on face
 * (i+1) % FACES, which is the face square-on to the camera at yaw 90°·(i+1).
 * Nothing is ever repainted — turning the airframe is what changes the page.
 * Within a page the body texture's UV window pans down the tall canvas.
 */
function DroneScreens({
  progressRef,
}: {
  progressRef: React.RefObject<number>;
}) {
  // A Set, not an array — every panel registers two materials and React may
  // re-invoke the ref callbacks; adding the same instance twice is a no-op.
  const mats = useRef<Set<THREE.MeshBasicMaterial>>(new Set());
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const familyRef = useRef("monospace");

  const panels = useMemo(
    () =>
      DECK.map(() => {
        const make = (w: number, h: number) => {
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(w * TEX_SS);
          canvas.height = Math.round(h * TEX_SS);
          const ctx = canvas.getContext("2d")!;
          // Persistent transform — the draw code works in design coordinates
          ctx.setTransform(TEX_SS, 0, 0, TEX_SS, 0, 0);
          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 4;
          return { ctx, texture };
        };
        return {
          chrome: make(TEX_W, TEX_H),
          body: make(BODY_W, BODY_H),
          /** Drawn content height, set on paint */
          contentH: BODY_H,
        };
      }),
    [],
  );

  const paint = useMemo(
    () => () => {
      panels.forEach((panel, i) => {
        drawChrome(panel.chrome.ctx, DECK[i], i, familyRef.current);
        panel.chrome.texture.needsUpdate = true;
        panel.contentH = drawBody(panel.body.ctx, DECK[i], familyRef.current);
        panel.body.texture.needsUpdate = true;
        // Window height in UV, anchored so t=0 shows the top of the content
        panel.body.texture.repeat.set(1, WIN_H / BODY_H);
      });
    },
    [panels],
  );

  // Resolve the real next/font family, then repaint once it has loaded
  useEffect(() => {
    const declared = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-tech")
      .trim();
    if (declared) familyRef.current = `${declared}, monospace`;

    paint();

    let cancelled = false;
    const repaint = () => {
      if (!cancelled) paint();
    };
    try {
      document.fonts.load(`21px ${familyRef.current}`).then(repaint, repaint);
      document.fonts.ready.then(repaint, repaint);
    } catch {
      repaint();
    }
    return () => {
      cancelled = true;
    };
  }, [paint]);

  useEffect(
    () => () =>
      panels.forEach((panel) => {
        panel.chrome.texture.dispose();
        panel.body.texture.dispose();
      }),
    [panels],
  );

  useFrame(() => {
    const p = progressRef.current;
    const opacity = track(p, SCREEN_FADE_STOPS, SCREEN_FADE_VALUES);

    panels.forEach((panel, i) => {
      const t = pageScrollFor(p, i);
      const reach = Math.max(0, panel.contentH - WIN_H);
      // Slide the UV window down the canvas: top of content at t=0
      panel.body.texture.offset.y = 1 - WIN_H / BODY_H - (t * reach) / BODY_H;

      const bar = bars.current[i];
      if (bar) {
        const frac = Math.min(1, WIN_H / Math.max(panel.contentH, WIN_H));
        bar.scale.y = frac;
        bar.position.y = BODY_QUAD_Y + ((1 - frac) * BODY_QUAD_H) / 2 - t * (1 - frac) * BODY_QUAD_H;
        (bar.material as THREE.MeshBasicMaterial).opacity =
          reach > 4 ? opacity * 0.65 : 0;
      }
    });

    for (const mat of mats.current) if (mat) mat.opacity = opacity;
  });

  return (
    <>
      {panels.map((panel, i) => (
        <group
          key={i}
          rotation={[0, ((1 - ((i + 1) % FACES)) * Math.PI) / 2, 0]}
        >
          <ScreenPanel
            chrome={panel.chrome.texture}
            body={panel.body.texture}
            onMaterial={(m) => {
              if (m) mats.current.add(m);
            }}
            scrollBarRef={(m) => {
              bars.current[i] = m;
            }}
          />
        </group>
      ))}
    </>
  );
}

/** One propeller: two pitched blades over a translucent sweep disk. */
function Propeller({
  spinRef,
  cw,
}: {
  spinRef: React.RefObject<THREE.Group | null>;
  cw: boolean;
}) {
  const pitch = cw ? 0.2 : -0.2;
  return (
    <>
      <group ref={spinRef}>
        {[0, Math.PI].map((a) => (
          <group key={a} rotation={[0, a, 0]}>
            {/* Root — narrow, then a wider paddle toward the tip */}
            <mesh position={[0.16, 0, 0]} rotation={[pitch, 0, 0]}>
              <boxGeometry args={[0.24, 0.011, 0.05]} />
              <meshStandardMaterial color="#141d2c" metalness={0.3} roughness={0.55} />
            </mesh>
            <mesh position={[0.42, 0, 0]} rotation={[pitch * 0.75, 0, 0]}>
              <boxGeometry args={[0.32, 0.009, 0.082]} />
              <meshStandardMaterial color="#141d2c" metalness={0.3} roughness={0.55} />
            </mesh>
            <mesh position={[0.58, 0, 0]} rotation={[pitch * 0.5, 0, 0]}>
              <boxGeometry args={[0.06, 0.008, 0.05]} />
              <meshStandardMaterial color="#141d2c" metalness={0.3} roughness={0.55} />
            </mesh>
          </group>
        ))}
        {/* Hub nut */}
        <mesh>
          <cylinderGeometry args={[0.05, 0.058, 0.05, 10]} />
          <meshStandardMaterial color="#1d2a3d" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* Sweep blur */}
      <mesh>
        <cylinderGeometry args={[PROP_R, PROP_R, 0.004, 28]} />
        <meshStandardMaterial
          color="#bfe9ff"
          emissive="#00e5ff"
          emissiveIntensity={0.28}
          transparent
          opacity={0.13}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function Drone({ progressRef }: { progressRef: React.RefObject<number> }) {
  const p0 = useRef<THREE.Group>(null);
  const p1 = useRef<THREE.Group>(null);
  const p2 = useRef<THREE.Group>(null);
  const p3 = useRef<THREE.Group>(null);
  const props = useMemo(() => [p0, p1, p2, p3], []);

  useFrame((_, dt) => {
    props.forEach((r, i) => {
      if (r.current) r.current.rotation.y += dt * (i % 2 === 0 ? 30 : -30);
    });
  });

  // Arms sweep outward and slightly up — solved once as quaternions
  const arms = useMemo(
    () =>
      MOTOR_XZ.map(([mx, mz]) => {
        const root = new THREE.Vector3(mx * 0.30, 0.0, mz * 0.30);
        const tip = new THREE.Vector3(mx, MOTOR_Y - 0.03, mz);
        const span = tip.clone().sub(root);
        const len = span.length();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          span.clone().normalize(),
        );
        const mid = root.clone().add(tip).multiplyScalar(0.5);
        return {
          mid: mid.toArray() as [number, number, number],
          quaternion,
          len,
        };
      }),
    [],
  );

  return (
    <group>
      {/* ── Fuselage ─────────────────────────────────────────── */}
      {/* Lower hull */}
      <mesh scale={[1.0, 0.40, 1.34]}>
        <sphereGeometry args={[0.5, 22, 14]} />
        <meshStandardMaterial color="#101b2c" metalness={0.6} roughness={0.34} />
      </mesh>
      {/* Belly fairing */}
      <mesh position={[0, -0.09, 0.04]} scale={[0.86, 0.22, 1.16]}>
        <sphereGeometry args={[0.5, 18, 10]} />
        <meshStandardMaterial color="#0a1320" metalness={0.45} roughness={0.55} />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, 0.10, 0.08]} scale={[0.74, 0.30, 0.98]}>
        <sphereGeometry args={[0.5, 20, 12]} />
        <meshStandardMaterial color="#060c16" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Battery pack */}
      <mesh position={[0, 0.20, -0.22]}>
        <boxGeometry args={[0.44, 0.15, 0.56]} />
        <meshStandardMaterial color="#0c1524" metalness={0.55} roughness={0.42} />
      </mesh>
      {/* GNSS puck */}
      <mesh position={[0, 0.30, -0.22]}>
        <cylinderGeometry args={[0.12, 0.13, 0.045, 16]} />
        <meshStandardMaterial color="#131f31" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Antennas */}
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.04, -0.62]} rotation={[0.55, 0, 0]}>
          <cylinderGeometry args={[0.011, 0.013, 0.3, 6]} />
          <meshStandardMaterial color="#0d1726" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
      {/* Nav lights */}
      <mesh position={[0, 0.0, 0.66]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={4} />
      </mesh>
      <mesh position={[0, 0.0, -0.66]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff2222" emissiveIntensity={4} />
      </mesh>

      {/* Mission displays — one per face */}
      <DroneScreens progressRef={progressRef} />

      {/* ── Arms, motors, propellers ─────────────────────────── */}
      {MOTOR_XZ.map(([mx, mz], i) => (
        <group key={i}>
          {/* Tapered arm */}
          <mesh position={arms[i].mid} quaternion={arms[i].quaternion}>
            <cylinderGeometry args={[0.042, 0.072, arms[i].len, 10]} />
            <meshStandardMaterial color="#101a29" metalness={0.55} roughness={0.4} />
          </mesh>
          {/* Motor mount */}
          <mesh position={[mx, MOTOR_Y - 0.02, mz]}>
            <cylinderGeometry args={[0.085, 0.105, 0.07, 14]} />
            <meshStandardMaterial color="#0c1522" metalness={0.7} roughness={0.35} />
          </mesh>
          {/* Stator can */}
          <mesh position={[mx, MOTOR_Y + 0.05, mz]}>
            <cylinderGeometry args={[0.105, 0.1, 0.09, 16]} />
            <meshStandardMaterial color="#16202f" metalness={0.92} roughness={0.18} />
          </mesh>
          {/* Bell */}
          <mesh position={[mx, MOTOR_Y + 0.11, mz]}>
            <cylinderGeometry args={[0.088, 0.104, 0.045, 16]} />
            <meshStandardMaterial
              color="#1d2b3f"
              emissive="#00325f"
              emissiveIntensity={0.35}
              metalness={0.95}
              roughness={0.12}
            />
          </mesh>
          {/* Arm-tip position light */}
          <mesh position={[mx, MOTOR_Y - 0.07, mz]}>
            <sphereGeometry args={[0.028, 8, 6]} />
            <meshStandardMaterial
              color={mz > 0 ? "#00e5ff" : "#ff2222"}
              emissive={mz > 0 ? "#00e5ff" : "#ff2222"}
              emissiveIntensity={3.5}
            />
          </mesh>

          <group position={[mx, MOTOR_Y + 0.15, mz]}>
            <Propeller spinRef={props[i]} cw={i % 2 === 0} />
          </group>
        </group>
      ))}

      {/* ── Two-axis camera gimbal ───────────────────────────── */}
      <group position={[0, -0.24, 0.44]}>
        {/* Yoke */}
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 0.05, 0]}>
            <boxGeometry args={[0.028, 0.18, 0.09]} />
            <meshStandardMaterial color="#0e1826" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        {/* Camera housing */}
        <mesh position={[0, -0.03, 0]}>
          <boxGeometry args={[0.19, 0.17, 0.16]} />
          <meshStandardMaterial color="#0a121e" metalness={0.75} roughness={0.28} />
        </mesh>
        {/* Lens barrel */}
        <mesh position={[0, -0.03, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.062, 0.068, 0.07, 16]} />
          <meshStandardMaterial color="#141f2e" metalness={0.85} roughness={0.18} />
        </mesh>
        {/* Glass */}
        <mesh position={[0, -0.03, 0.147]}>
          <circleGeometry args={[0.05, 16]} />
          <meshStandardMaterial
            color="#000811"
            emissive="#0088cc"
            emissiveIntensity={1.6}
            metalness={1}
            roughness={0.05}
          />
        </mesh>
      </group>

      {/* ── Landing skids ────────────────────────────────────── */}
      {[-0.46, 0.46].map((x) => (
        <group key={x}>
          <mesh position={[x, -0.60, 0]}>
            <boxGeometry args={[0.062, 0.05, 1.12]} />
            <meshStandardMaterial color="#0d1726" metalness={0.45} roughness={0.55} />
          </mesh>
          {[-0.32, 0.32].map((z) => (
            <mesh
              key={z}
              position={[x * 0.82, -0.4, z]}
              rotation={[0, 0, x > 0 ? -0.24 : 0.24]}
            >
              <boxGeometry args={[0.045, 0.42, 0.055]} />
              <meshStandardMaterial color="#0d1726" metalness={0.45} roughness={0.55} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Rescue payload ───────────────────────────────────── */}
      {/* Winch spool */}
      <mesh position={[0, -0.34, -0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, 0.12, 12]} />
        <meshStandardMaterial color="#16212f" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Tether */}
      <mesh position={[0, -0.62, -0.02]}>
        <cylinderGeometry args={[0.008, 0.008, 0.46, 5]} />
        <meshStandardMaterial color="#9fe4ff" transparent opacity={0.4} />
      </mesh>
      {/* Flotation device */}
      <group position={[0, -0.93, -0.02]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.13, 0.052, 10, 20]} />
          <meshStandardMaterial
            color="#ff5a1f"
            emissive="#ff3300"
            emissiveIntensity={0.35}
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshStandardMaterial color="#f4f8ff" metalness={0.1} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// ── Lightweight cloud puff cluster ───────────────────────────────
const PUFFS: [number, number, number, number][] = [
  [ 0,    0,    0,    1.6],
  [-2.1,  0.4,  0.2,  1.3],
  [ 2.0,  0.3, -0.2,  1.2],
  [-1.0,  0.9, -0.5,  1.0],
  [ 1.3,  0.7,  0.5,  0.95],
  [ 0,    1.3,  0,    0.85],
];

function CloudCluster({
  position,
  scale = 1,
  opacity = 0.12,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {PUFFS.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 7, 5]} />
          <meshStandardMaterial
            color="#ddeeff"
            transparent
            opacity={opacity}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Scene: imperative scroll-driven updates (zero re-renders) ─────
function SceneContent({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const progressRef  = useRef(0);
  const ambientRef   = useRef<THREE.AmbientLight>(null);
  const sunRef       = useRef<THREE.DirectionalLight>(null);
  const droneRef     = useRef<THREE.Group>(null);
  const starsRef     = useRef<THREE.Group>(null);

  // Cached color objects — avoid GC pressure in useFrame
  const dayColor  = useRef(new THREE.Color("#ffffff"));
  const duskColor = useRef(new THREE.Color("#ff6633"));

  const { camera } = useThree();

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      progressRef.current = v;
    });
  }, [scrollYProgress]);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const t = clock.elapsedTime;

    // ── Lights ───────────────────────────────────────────────────
    // The sky itself is a CSS gradient behind this transparent canvas; these
    // only light the clouds and the airframe.
    if (ambientRef.current) {
      ambientRef.current.intensity = L(1.45, 0.12, p);
    }
    if (sunRef.current) {
      sunRef.current.intensity = L(1.6, 0.12, p);
      sunRef.current.color.lerpColors(
        dayColor.current,
        duskColor.current,
        Math.min(p * 1.8, 1),
      );
    }

    // ── Stars appear at dusk ─────────────────────────────────────
    if (starsRef.current) {
      starsRef.current.visible = p > 0.64;
    }

    // ── Camera descends to reinforce "flying down" ───────────────
    const camY  = L(1.5, -1.0, p);
    const lookY = L(0.5, -0.5, p);
    camera.position.y = camY;
    (camera as THREE.PerspectiveCamera).lookAt(0, lookY, 0);

    // ── Drone: recede, quarter-turn, come back forward ───────────
    if (droneRef.current) {
      const { z, s, yaw, drop } = dronePose(p);

      // Solve Y so the presented face keeps its framing as the camera sinks
      // and the drone's distance changes through every cycle.
      const dist = Math.max(1.2, 8 - z - 0.95 * s);
      const y = camY + dist * ((lookY - camY) / 8 - drop);

      droneRef.current.position.y = y + Math.sin(t * 1.4) * 0.06;
      droneRef.current.position.z = z;
      droneRef.current.scale.setScalar(s);
      droneRef.current.rotation.y = yaw + Math.sin(t * 0.6) * 0.016;
      droneRef.current.rotation.z = Math.sin(t * 0.85) * 0.02;
      droneRef.current.rotation.x = Math.sin(t * 1.15) * 0.014;
    }
  });

  return (
    <>
      {/* Stars — hidden until dusk */}
      <group ref={starsRef} visible={false}>
        <Stars radius={90} depth={50} count={3500} factor={4} fade speed={0} />
      </group>

      {/* Lighting */}
      <ambientLight ref={ambientRef} intensity={1.45} />
      <directionalLight ref={sunRef} position={[5, 10, 5]} intensity={1.6} />
      <pointLight position={[0, 0.5, 1]} color="#00e5ff" intensity={1.6} distance={9} />

      {/* Cloud layers — banked high so the drone flies in clear sky below.
          Opaque enough to read as cloud against the gradient behind. */}
      <CloudCluster position={[-14, 10, -32]} scale={2.2} opacity={0.5} />
      <CloudCluster position={[ 11, 12, -28]} scale={1.7} opacity={0.42} />
      <CloudCluster position={[ -7,  8, -22]} scale={1.4} opacity={0.38} />
      <CloudCluster position={[ 17,  9, -38]} scale={2.5} opacity={0.32} />
      <CloudCluster position={[-20, 11, -44]} scale={1.9} opacity={0.28} />
      <CloudCluster position={[  6,  7, -18]} scale={1.3} opacity={0.34} />

      {/* Drone group */}
      <group ref={droneRef} position={[0, -2, HERO_Z]} scale={HERO_S}>
        <Drone progressRef={progressRef} />
      </group>
    </>
  );
}

// ── Canvas export ─────────────────────────────────────────────────
export default function DroneScene({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 8], fov: 52 }}
      // Transparent — the sky is a CSS gradient rendered behind this canvas,
      // which keeps its colour exact instead of at the mercy of tone mapping.
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      dpr={[1, 1.5]}
      frameloop="always"
    >
      <SceneContent scrollYProgress={scrollYProgress} />
    </Canvas>
  );
}
