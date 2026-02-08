export const features = [
  {
    icon: "radar",
    title: "Detect",
    desc: "AI spots humans in distress using RGB + thermal imaging with 94% confidence.",
  },
  {
    icon: "crosshair",
    title: "Track",
    desc: "Locks onto target and maintains persistent visual tracking through waves and glare.",
  },
  {
    icon: "alert",
    title: "Alert",
    desc: "Pings the nearest qualified lifeguard instantly via the SALVO responder network.",
  },
  {
    icon: "deploy",
    title: "Deploy",
    desc: "Launches a tethered flotation device in seconds — buying critical time until help arrives.",
  },
];

export const specs = [
  "NVIDIA Jetson Orin Nano — Edge AI Brain",
  "FLIR Lepton 3.5 / Boson Thermal Camera",
  "1080p RGB @ 30fps Wide-Angle Lens",
  "ESP32 Control System — Servo + Winch",
  "250–500g Rescue Payload Capacity",
  "5–10m Throw Range — 15–30m Tether",
  "Dual-Stage Safety Arming (Physical + Software)",
  "Wi-Fi Video Stream + LTE Ready",
];

export const systemStates = [
  "SCAN",
  "DETECT",
  "TRACK",
  "ASSESS",
  "ALERT",
  "DEPLOY",
  "POST-DEPLOY",
] as const;

export type SystemState = (typeof systemStates)[number];

export const stateColors: Record<SystemState, string> = {
  SCAN: "#00e5ff",
  DETECT: "#ffab00",
  TRACK: "#00e676",
  ASSESS: "#ff9100",
  ALERT: "#ff1744",
  DEPLOY: "#d500f9",
  "POST-DEPLOY": "#00e5ff",
};

export const systemEvents = [
  { time: "00:00:12", state: "SCAN" as SystemState, msg: "Scanning sector 3..." },
  {
    time: "00:00:18",
    state: "DETECT" as SystemState,
    msg: "Human detected — confidence 94%",
  },
  {
    time: "00:00:21",
    state: "TRACK" as SystemState,
    msg: "Target locked — tracking active",
  },
  {
    time: "00:00:25",
    state: "ASSESS" as SystemState,
    msg: "Distress score: 87/100",
  },
  {
    time: "00:00:28",
    state: "ALERT" as SystemState,
    msg: "Pinging nearest lifeguard...",
  },
  {
    time: "00:00:32",
    state: "DEPLOY" as SystemState,
    msg: "Arm fired — line paying out",
  },
  {
    time: "00:00:35",
    state: "POST-DEPLOY" as SystemState,
    msg: "Float deployed — tracking target",
  },
];

export const detections = [
  {
    id: 1,
    x: 42,
    y: 35,
    w: 12,
    h: 18,
    label: "Person",
    confidence: 0.94,
    distress: true,
  },
  {
    id: 2,
    x: 70,
    y: 55,
    w: 8,
    h: 10,
    label: "Person",
    confidence: 0.72,
    distress: false,
  },
];
