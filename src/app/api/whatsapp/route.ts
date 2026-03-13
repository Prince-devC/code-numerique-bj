import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/chat-engine";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "code-numerique-bj";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

// Webhook verification (GET)
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Incoming messages (POST)
export async function POST(req: NextRequest) {
  const body = await req.json();

  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || message.type !== "text") {
    return NextResponse.json({ status: "ignored" });
  }

  const from = message.from; // sender phone number
  const text = message.text.body;

  const result = await processMessage(text);

  // Format sources for WhatsApp
  let reply = result.answer;
  if (result.sources.length > 0) {
    reply += "\n\n📚 *Sources :* " + result.sources.map((s) => `Art. ${s.article}`).join(", ");
  }

  // Send reply via WhatsApp API
  await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: reply },
    }),
  });

  return NextResponse.json({ status: "ok" });
}
