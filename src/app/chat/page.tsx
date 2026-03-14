"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import {
  SendHorizonal,
  Sun,
  Moon,
  Shield,
  Lock,
  AlertTriangle,
  FileCheck,
  ShoppingCart,
  BookOpen,
  User,
  MessageSquare,
  Plus,
  Trash2,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";

type Source = { article: string; livre: string; excerpt: string; page?: number };
type Message = { role: "user" | "assistant"; content: string; sources?: Source[] };
type Conversation = { id: string; title: string; messages: Message[]; date: string };

const SUGGESTIONS = [
  { text: "Quels sont mes droits sur mes données personnelles ?", icon: Shield },
  { text: "Que dit la loi sur les cybercrimes au Bénin ?", icon: Lock },
  { text: "Puis-je être poursuivi pour un post sur les réseaux sociaux ?", icon: AlertTriangle },
  { text: "Comment fonctionne la signature électronique ?", icon: FileCheck },
  { text: "Quelles obligations pour un site e-commerce ?", icon: ShoppingCart },
  { text: "Quelles sanctions pour le piratage informatique ?", icon: Lock },
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const { theme, setTheme } = useTheme();
  const bottomRef = useRef<HTMLDivElement>(null);

  const getSessionKey = () => {
    let sid = sessionStorage.getItem("mondroit_sid");
    if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem("mondroit_sid", sid); }
    return `conversations_${sid}`;
  };

  useEffect(() => {
    setMounted(true);
    try {
      const s = localStorage.getItem(getSessionKey());
      if (s) {
        const c: Conversation[] = JSON.parse(s);
        setConversations(c);
        if (c.length > 0) { setActiveId(c[0].id); setMessages(c[0].messages); }
      }
    } catch {}
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const save = (c: Conversation[]) => { setConversations(c); localStorage.setItem(getSessionKey(), JSON.stringify(c)); };
  const newChat = () => { setMessages([]); setActiveId(null); setSidebar(false); };
  const switchChat = (id: string) => { const c = conversations.find((x) => x.id === id); if (c) { setActiveId(id); setMessages(c.messages); setSidebar(false); } };
  const deleteChat = (id: string) => {
    const u = conversations.filter((c) => c.id !== id); save(u);
    if (activeId === id) { if (u.length) { setActiveId(u[0].id); setMessages(u[0].messages); } else { setActiveId(null); setMessages([]); } }
  };

  const send = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: q };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);
    let cid = activeId;
    if (!cid) {
      cid = Date.now().toString();
      setActiveId(cid);
      save([{ id: cid, title: q.length > 50 ? q.slice(0, 50) + "..." : q, messages: newMsgs, date: new Date().toLocaleDateString("fr-FR") }, ...conversations]);
    } else {
      save(conversations.map((c) => c.id === cid ? { ...c, messages: newMsgs } : c));
    }
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q }) });
      const data = await res.json();
      const final = [...newMsgs, { role: "assistant" as const, content: data.answer, sources: data.sources }];
      setMessages(final);
      save((cid === activeId ? conversations : [{ id: cid!, title: q.slice(0, 50), messages: [], date: new Date().toLocaleDateString("fr-FR") }, ...conversations]).map((c) => c.id === cid ? { ...c, messages: final } : c));
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "Une erreur est survenue. Veuillez réessayer." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Overlay */}
      {sidebar && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebar(false)} />}

      {/* ===== SIDEBAR ===== */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto ${sidebar ? "translate-x-0" : "-translate-x-full"}`} style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}>
        {/* Sidebar head */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <Link href="/" className="flex items-center gap-2.5 text-lg">
            <img src="/logo-icon.svg" alt="" className="w-8 h-8 rounded-lg" />
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>mondroit</span>
            <span style={{ color: "var(--text-muted)" }}>.bj</span>
          </Link>
          <div className="flex gap-1">
            <button onClick={newChat} className="p-1.5 rounded-md transition-colors" style={{ color: "var(--text-muted)" }}><Plus className="w-4 h-4" /></button>
            <button onClick={() => setSidebar(false)} className="p-1.5 rounded-md lg:hidden" style={{ color: "var(--text-muted)" }}><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <MessageSquare className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Aucune conversation</p>
            </div>
          ) : conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => switchChat(c.id)}
              className="group flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-colors mb-0.5"
              style={{ background: c.id === activeId ? "var(--bg-tertiary)" : "transparent" }}>
              <MessageSquare className="w-3.5 h-3.5 shrink-0" style={{ color: c.id === activeId ? "var(--gov-green)" : "var(--text-muted)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: c.id === activeId ? "var(--text-primary)" : "var(--text-secondary)" }}>{c.title}</p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{c.date}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity">
                <Trash2 className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar foot */}
        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-xs">Retour au site</span>
          </Link>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-5 h-14 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebar(true)} className="lg:hidden"><Menu className="w-5 h-5" style={{ color: "var(--text-primary)" }} /></button>
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {activeId ? conversations.find(c => c.id === activeId)?.title || "Conversation" : "Nouvelle conversation"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button onClick={newChat} className="p-2 rounded-md transition-colors" style={{ color: "var(--text-muted)" }}>
                <Plus className="w-4 h-4" />
              </button>
            )}
            {mounted && (
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-md transition-colors" style={{ color: "var(--text-muted)" }}>
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* ===== EMPTY STATE (Astroship energy) ===== */
            <div className="max-w-screen-xl mx-auto px-5">
              <div className="grid lg:grid-cols-2 place-items-center pt-16 pb-8 md:pt-12 md:pb-24">
                {/* Left: text */}
                <div>
                  <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold lg:tracking-tight xl:tracking-tighter" style={{ color: "var(--text-primary)" }}>
                    Interrogez le Code du Numérique.
                  </h1>
                  <p className="text-lg mt-4 max-w-xl" style={{ color: "var(--text-secondary)" }}>
                    Posez vos questions en langage courant. L&apos;assistant analyse les 539 articles et vous fournit une réponse claire avec les références exactes.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-xl">
                    {SUGGESTIONS.map(({ text, icon: Icon }) => (
                      <button
                        key={text}
                        onClick={() => send(text)}
                        className="flex gap-3 items-start text-left p-4 rounded-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <div className="mt-0.5 rounded-full p-1.5 shrink-0" style={{ background: "var(--gov-green)" }}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{text}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Right: logo */}
                <div className="py-6 md:order-1 hidden md:flex items-center justify-center">
                  <img src="/logo.svg" alt="" className="w-[320px] h-[320px] drop-shadow-xl" />
                </div>
              </div>
            </div>
          ) : (
            /* ===== MESSAGES ===== */
            <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <img src="/logo-icon.svg" alt="" className="w-8 h-8 rounded-lg shrink-0 mt-1" />
                  )}
                  <div className={`max-w-[80%]`}>
                    <div
                      className="px-5 py-4"
                      style={msg.role === "user"
                        ? { background: "var(--gov-green)", color: "white", borderRadius: "20px 20px 4px 20px" }
                        : { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "20px 20px 20px 4px", color: "var(--text-primary)" }}>
                      {msg.role === "user" ? (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      ) : (
                        <div className="prose-chat text-sm"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                      )}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                        {msg.sources.map((s, j) => (
                          <a
                            key={j}
                            href={`/viewer?article=${encodeURIComponent(s.article)}${s.page ? `&page=${s.page}` : ""}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full transition-all hover:scale-105 cursor-pointer"
                            style={{ background: "rgba(0,98,51,0.08)", color: "var(--text-accent)", border: "1px solid rgba(0,98,51,0.15)" }}>
                            <BookOpen className="w-3 h-3" />
                            Art. {s.article}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-lg shrink-0 mt-1 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
                      <User className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-4">
                  <img src="/logo-icon.svg" alt="" className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="px-5 py-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "20px 20px 20px 4px" }}>
                    <div className="flex items-center gap-1.5">
                      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ===== INPUT (Astroship button style) ===== */}
        <div className="shrink-0 px-5 pb-5 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 rounded-lg px-4 py-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <textarea
                value={input}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); (e.target as HTMLTextAreaElement).style.height = "auto"; } }}
                placeholder="Posez votre question sur le Code du Numérique..."
                disabled={loading}
                rows={1}
                className="flex-1 resize-none outline-none text-sm leading-relaxed"
                style={{ background: "transparent", color: "var(--text-primary)", border: "none", fontFamily: "inherit", fontSize: "14px" }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="shrink-0 rounded-sm px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                style={{
                  background: input.trim() ? "var(--gov-green)" : "var(--bg-tertiary)",
                  color: input.trim() ? "white" : "var(--text-muted)",
                  cursor: input.trim() ? "pointer" : "default",
                }}>
                <SendHorizonal className="w-4 h-4" />
                Envoyer
              </button>
            </div>
            <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Information juridique uniquement. Ne constitue pas un avis juridique officiel.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
