import { EventEmitter } from "events";

export interface DistressAlert {
  track_id: number;
  level: "warning" | "critical";
  distress_score: number;
  gesture: string;
  timestamp: number;
  frame_id: number;
  bbox: { x1: number; y1: number; x2: number; y2: number };
}

export interface DistressEvent {
  source_id: string;
  alert: DistressAlert;
  snapshot_jpeg_b64?: string;
  received_at: number;
}

const emitter = new EventEmitter();
emitter.setMaxListeners(200);

export function emitDistress(event: DistressEvent) {
  emitter.emit("distress", event);
}

export function subscribeDistress(cb: (event: DistressEvent) => void) {
  emitter.on("distress", cb);
  return () => emitter.off("distress", cb);
}
