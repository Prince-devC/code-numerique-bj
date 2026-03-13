import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/chat-engine";

const rateMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateMap.get(ip) || []).filter((t) => now - t < 60_000);
  if (timestamps.length >= 20) return true;
  timestamps.push(now);
  rateMap.set(ip, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { answer: "Trop de requêtes. Veuillez patienter une minute.", sources: [] },
      { status: 429 }
    );
  }

  const { message } = await req.json();
  if (!message) {
    return NextResponse.json({ error: "Message requis" }, { status: 400 });
  }

  const result = await processMessage(message);
  return NextResponse.json(result);
}
