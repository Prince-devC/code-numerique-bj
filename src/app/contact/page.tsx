"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const inputStyle = {
    background: "var(--bg-primary)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-screen-xl mx-auto px-5">
        <header className="flex items-center justify-between my-5">
          <Link href="/" className="flex items-center gap-2.5 text-lg">
            <img src="/logo-icon.svg" alt="" className="w-8 h-8 rounded-lg" />
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>mondroit</span>
            <span style={{ color: "var(--text-muted)" }}>.bj</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </header>
      </div>

      <div className="max-w-xl mx-auto px-5 py-16">
        <h1 className="text-4xl lg:text-5xl font-bold lg:tracking-tight" style={{ color: "var(--text-primary)" }}>
          Contactez-nous
        </h1>
        <p className="text-lg mt-4 mb-10" style={{ color: "var(--text-secondary)" }}>
          Une question, une suggestion ou un partenariat ? Envoyez-nous un message.
        </p>

        {status === "sent" ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <CheckCircle className="w-12 h-12" style={{ color: "var(--gov-green)" }} />
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Message envoyé</h2>
            <p style={{ color: "var(--text-secondary)" }}>Nous vous répondrons dans les plus brefs délais.</p>
            <Link href="/" className="mt-4 rounded-sm px-5 py-2.5 text-sm font-medium text-white" style={{ background: "var(--gov-green)" }}>
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Nom</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
                style={{ ...inputStyle, "--tw-ring-color": "var(--gov-green)" } as React.CSSProperties}
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
                style={{ ...inputStyle, "--tw-ring-color": "var(--gov-green)" } as React.CSSProperties}
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-colors resize-none focus:ring-2"
                style={{ ...inputStyle, "--tw-ring-color": "var(--gov-green)" } as React.CSSProperties}
                placeholder="Votre message..."
              />
            </div>
            {status === "error" && (
              <p className="text-sm" style={{ color: "var(--gov-red)" }}>Erreur lors de l&apos;envoi. Réessayez.</p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex items-center justify-center gap-2 w-full rounded-sm px-5 py-2.5 text-sm font-medium text-white transition-colors"
              style={{ background: "var(--gov-green)" }}>
              {status === "sending" ? "Envoi en cours..." : <><Send className="w-4 h-4" /> Envoyer le message</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
