import { NextRequest } from "next/server";
import { emitDistress, type DistressEvent } from "@/lib/distress-store";

export async function POST(req: NextRequest) {
  let body: DistressEvent & { event?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.alert || !body.source_id) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  emitDistress({
    source_id: body.source_id,
    alert: body.alert,
    snapshot_jpeg_b64: body.snapshot_jpeg_b64,
    received_at: Date.now(),
  });

  return Response.json({ received: true });
}
