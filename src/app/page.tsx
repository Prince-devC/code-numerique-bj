"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sun,
  Moon,
  Search,
  MessageSquare,
  Shield,
  BookOpen,
  Zap,
  Globe,
  CloudDownload,
  Menu,
  X,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Recherche sémantique",
    desc: "Posez votre question en langage courant. Le système identifie les articles pertinents par analyse vectorielle, pas par mots-clés.",
  },
  {
    icon: MessageSquare,
    title: "Multicanal",
    desc: "Accessible via le web, WhatsApp et Telegram. Les citoyens consultent le droit numérique depuis les outils qu'ils utilisent déjà.",
  },
  {
    icon: Shield,
    title: "Sources vérifiables",
    desc: "Chaque réponse cite les articles exacts du Code. Le système ne répond qu'à partir du corpus juridique officiel.",
  },
  {
    icon: Zap,
    title: "Réponse instantanée",
    desc: "Analyse et synthèse en moins de deux secondes. Plus besoin de parcourir des centaines de pages pour trouver l'information.",
  },
  {
    icon: BookOpen,
    title: "Corpus complet",
    desc: "L'intégralité de la Loi 2017-20 et sa modification par la Loi 2020-35, structurée et prête à être interrogée.",
  },
  {
    icon: Globe,
    title: "Accessible à tous",
    desc: "Interface pensée pour le grand public. Pas besoin de formation juridique pour comprendre ses droits numériques.",
  },
];

const menuitems = [
  { title: "Fonctionnalités", path: "#features" },
  { title: "Comment ça marche", path: "#how" },
  { title: "Contact", path: "/contact" },
];

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg-primary)" }}>
      {/* ===== NAVBAR (Astroship style) ===== */}
      <div className="max-w-screen-xl mx-auto px-5">
        <header className="flex flex-col lg:flex-row justify-between items-center my-5">
          <div className="flex w-full lg:w-auto items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 text-lg">
              <img src="/logo-icon.svg" alt="" className="w-8 h-8 rounded-lg" />
              <span className="font-bold" style={{ color: "var(--text-primary)" }}>mondroit</span>
              <span style={{ color: "var(--text-muted)" }}>.bj</span>
            </Link>
            <button className="block lg:hidden" onClick={() => setOpen(!open)}>
              {open
                ? <X className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
                : <Menu className="w-5 h-5" style={{ color: "var(--text-primary)" }} />}
            </button>
          </div>

          <nav className={`${open ? "block" : "hidden"} w-full lg:w-auto mt-2 lg:flex lg:mt-0`}>
            <ul className="flex flex-col lg:flex-row lg:gap-3">
              {menuitems.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.path}
                    onClick={() => setOpen(false)}
                    className="flex lg:px-3 py-2 items-center transition-colors hover:opacity-80"
                    style={{ color: "var(--text-secondary)" }}>
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
            <div className="lg:hidden flex items-center mt-3 gap-4">
              {mounted && (
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="px-4 py-2 rounded-sm w-full text-center text-sm" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                  {theme === "dark" ? "Mode clair" : "Mode sombre"}
                </button>
              )}
              <Link href="/chat" className="block w-full rounded-sm text-center px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--gov-green)" }}>
                Consulter
              </Link>
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            {mounted && (
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-secondary)" }}>
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <Link href="/chat" className="rounded-sm text-center transition px-5 py-2.5 text-sm font-medium text-white" style={{ background: "var(--gov-green)" }}>
              Consulter le Code
            </Link>
          </div>
        </header>
      </div>

      {/* ===== HERO (Astroship style: grid 2 cols) ===== */}
      <main className="max-w-screen-xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 place-items-center pt-16 pb-8 md:pt-12 md:pb-24">
          <div className="py-6 md:order-1 hidden md:flex items-center justify-center">
            <img src="/logo.svg" alt="mondroit.bj" className="w-[400px] h-[400px] drop-shadow-xl" />
          </div>
          <div>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold lg:tracking-tight xl:tracking-tighter" style={{ color: "var(--text-primary)" }}>
              Le Code du Numérique,{" "}
              <span style={{ color: "var(--gov-green)" }}>accessible à tous.</span>
            </h1>
            <p className="text-lg mt-4 max-w-xl" style={{ color: "var(--text-secondary)" }}>
              Un assistant juridique intelligent qui analyse les 539 articles du Code du Numérique du Bénin et fournit des réponses claires, sourcées et vérifiables. Disponible sur le web, WhatsApp et Telegram.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/chat"
                className="flex gap-2 items-center justify-center rounded-sm text-center transition px-5 py-2.5 text-white font-medium"
                style={{ background: "var(--gov-green)" }}>
                <CloudDownload className="w-5 h-5 text-white" />
                Poser une question
              </Link>
              <a
                href="#features"
                className="flex gap-2 items-center justify-center rounded-sm text-center transition px-5 py-2.5 border-2 font-medium"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--bg-primary)" }}>
                <BookOpen className="w-4 h-4" />
                En savoir plus
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FEATURES (Astroship style: title + 3-col grid) ===== */}
      <section id="features" className="max-w-screen-xl mx-auto px-5 pb-20">
        <div className="mt-16 md:mt-0">
          <h2 className="text-4xl lg:text-5xl font-bold lg:tracking-tight" style={{ color: "var(--text-primary)" }}>
            Tout ce dont vous avez besoin pour comprendre vos droits numériques
          </h2>
          <p className="text-lg mt-4" style={{ color: "var(--text-secondary)" }}>
            mondroit.bj combine recherche vectorielle et intelligence artificielle pour rendre le droit numérique béninois compréhensible par tous.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 mt-16 gap-16">
          {features.map((item) => (
            <div key={item.title} className="flex gap-4 items-start">
              <div className="mt-1 rounded-full p-2 w-8 h-8 shrink-0 flex items-center justify-center" style={{ background: "var(--gov-green)" }}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
                <p className="mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="max-w-screen-xl mx-auto px-5 pb-20">
        <div className="mt-16 md:mt-0 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold lg:tracking-tight" style={{ color: "var(--text-primary)" }}>
            Comment ça marche
          </h2>
          <p className="text-lg mt-4" style={{ color: "var(--text-secondary)" }}>
            Trois étapes simples pour accéder au droit numérique béninois.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 mt-16 gap-12 max-w-4xl mx-auto">
          {[
            { step: "01", title: "Posez votre question", desc: "En langage courant, sur le web, WhatsApp ou Telegram. Pas besoin de connaître les termes juridiques." },
            { step: "02", title: "Analyse intelligente", desc: "Le système recherche parmi les 539 articles du Code du Numérique les dispositions les plus pertinentes." },
            { step: "03", title: "Réponse sourcée", desc: "Vous recevez une explication claire avec les références exactes des articles de loi concernés." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="text-5xl font-bold mb-4" style={{ color: "rgba(0,98,51,0.15)" }}>{s.step}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{s.title}</h3>
              <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA (Astroship style: dark rounded box) ===== */}
      <section id="cta" className="max-w-screen-xl mx-auto px-5 pb-20">
        <div className="p-8 md:px-20 md:py-20 mt-20 mx-auto max-w-5xl rounded-lg flex flex-col items-center text-center" style={{ background: "var(--gov-green)" }}>
          <h2 className="text-white text-4xl md:text-6xl tracking-tight font-bold">
            Rendre le droit numérique accessible.
          </h2>
          <p className="text-white/70 mt-4 text-lg md:text-xl">
            mondroit.bj est conçu pour les citoyens, les entrepreneurs, les juristes et les administrations du Bénin. Gratuit, ouvert et disponible sur tous les canaux.
          </p>
          <div className="flex mt-5">
            <Link
              href="/chat"
              className="rounded-sm text-center transition px-5 py-2.5 border-2 border-transparent font-medium"
              style={{ background: "white", color: "var(--gov-green)" }}>
              Essayer maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER (Astroship style) ===== */}
      <footer className="my-20">
        <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Copyright &copy; {new Date().getFullYear()} mondroit.bj. Tous droits réservés.
        </p>
        <p className="text-center text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Information juridique uniquement. Ne constitue pas un avis juridique officiel.
        </p>
        <div className="flex items-center justify-center gap-1 mt-3">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--gov-green)" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--gov-yellow)" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--gov-red)" }} />
        </div>
      </footer>
    </div>
  );
}
