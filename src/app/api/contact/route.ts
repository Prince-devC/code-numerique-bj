import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "mondroit.bj <onboarding@resend.dev>",
      to: "prince.gnangnon2@gmail.com",
      subject: `[mondroit.bj] Message de ${name}`,
      replyTo: email,
      text: `Nom: ${name}\nEmail: ${email}\n\n${message}`,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur d'envoi." }, { status: 500 });
  }
}
