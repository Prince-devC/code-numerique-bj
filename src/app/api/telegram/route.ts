import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/chat-engine";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const msg = body?.message;
  if (!msg?.text) return NextResponse.json({ ok: true });

  const chatId = msg.chat.id;
  const result = await processMessage(msg.text);

  let reply = result.answer;
  if (result.sources.length > 0) {
    reply += "\n\n📚 Sources : " + result.sources.map((s) => `Art. ${s.article}`).join(", ");
  }

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: reply, parse_mode: "Markdown" }),
  });

  return NextResponse.json({ ok: true });
}
