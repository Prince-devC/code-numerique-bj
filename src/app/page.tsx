"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Button,
  Chip,
  Card,
  CardBody,
  Accordion,
  AccordionItem,
  Divider,
  Avatar,
  Tooltip,
} from "@heroui/react";
import ReactMarkdown from "react-markdown";
import {
  Scale,
  SendHorizonal,
  Sun,
  Moon,
  BookOpen,
  Shield,
  ShoppingCart,
  Wifi,
  FileCheck,
  Lock,
  AlertTriangle,
  User,
  Sparkles,
  ChevronRight,
  RotateCcw,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";

type Source = { article: string; livre: string; excerpt: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  date: string;
};

const SUGGESTIONS = [
  {
    text: "Quels sont mes droits si une entreprise utilise mes données personnelles ?",
    icon: Shield,
  },
  {
    text: "Que dit la loi sur les cybercrimes au Bénin ?",
    icon: Lock,
  },
  {
    text: "Puis-je être poursuivi pour un post sur les réseaux sociaux ?",
    icon: AlertTriangle,
  },
  {
    text: "Comment fonctionne la signature électronique ?",
    icon: FileCheck,
  },
  {
    text: "Quelles obligations pour un site e-commerce au Bénin ?",
    icon: ShoppingCart,
  },
  {
    text: "Quelles sanctions pour le piratage informatique ?",
    icon: Lock,
  },
];

const LIVRES = [
  { label: "Réseaux & Communications", icon: Wifi },
  { label: "Écrits Électroniques", icon: FileCheck },
  { label: "Services de Confiance", icon: Shield },
  { label: "Commerce Électronique", icon: ShoppingCart },
  { label: "Protection des Données", icon: Lock },
  { label: "Cybercriminalité", icon: AlertTriangle },
];

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("conversations");
    if (saved) {
      try {
        const convos: Conversation[] = JSON.parse(saved);
        setConversations(convos);
        if (convos.length > 0) {
          setActiveId(convos[0].id);
          setMessages(convos[0].messages);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveConversations = (convos: Conversation[]) => {
    setConversations(convos);
    localStorage.setItem("conversations", JSON.stringify(convos));
  };

  const updateActiveConvo = (msgs: Message[]) => {
    setMessages(msgs);
    if (!activeId) return;
    const updated = conversations.map((c) =>
      c.id === activeId ? { ...c, messages: msgs } : c
    );
    saveConversations(updated);
  };

  const newConversation = () => {
    setMessages([]);
    setActiveId(null);
  };

  const switchConversation = (id: string) => {
    const convo = conversations.find((c) => c.id === id);
    if (convo) {
      setActiveId(id);
      setMessages(convo.messages);
    }
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    saveConversations(updated);
    if (activeId === id) {
      if (updated.length > 0) {
        setActiveId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        setActiveId(null);
        setMessages([]);
      }
    }
  };

  const send = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: q };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);

    // Create conversation if new
    let currentId = activeId;
    if (!currentId) {
      currentId = Date.now().toString();
      const title = q.length > 50 ? q.slice(0, 50) + "..." : q;
      const newConvo: Conversation = {
        id: currentId,
        title,
        messages: newMsgs,
        date: new Date().toLocaleDateString("fr-FR"),
      };
      setActiveId(currentId);
      saveConversations([newConvo, ...conversations]);
    } else {
      const updated = conversations.map((c) =>
        c.id === currentId ? { ...c, messages: newMsgs } : c
      );
      saveConversations(updated);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      };
      const finalMsgs = [...newMsgs, assistantMsg];
      setMessages(finalMsgs);
      const updated = (currentId === activeId ? conversations : [{ id: currentId!, title: q.slice(0, 50), messages: [], date: new Date().toLocaleDateString("fr-FR") }, ...conversations])
        .map((c) => c.id === currentId ? { ...c, messages: finalMsgs } : c);
      saveConversations(updated);
    } catch {
      const errMsg: Message = {
        role: "assistant",
        content: "Une erreur est survenue. Veuillez réessayer.",
      };
      const finalMsgs = [...newMsgs, errMsg];
      setMessages(finalMsgs);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-[280px] shrink-0"
        style={{
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo + New chat */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--gov-green)" }}
            >
              <Scale className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1
                className="text-[13px] font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Code du Numérique
              </h1>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                République du Bénin
              </p>
            </div>
          </div>
          <Tooltip content="Nouvelle conversation">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={newConversation}
            >
              <Plus className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            </Button>
          </Tooltip>
        </div>

        {/* Conversation history */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <MessageSquare className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              <p className="text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
                Aucune conversation
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background: convo.id === activeId ? "var(--bg-tertiary)" : "transparent",
                  }}
                  onClick={() => switchConversation(convo.id)}
                >
                  <MessageSquare
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: convo.id === activeId ? "var(--gov-green)" : "var(--text-muted)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[12px] truncate"
                      style={{
                        color: convo.id === activeId ? "var(--text-primary)" : "var(--text-secondary)",
                      }}
                    >
                      {convo.title}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {convo.date}
                    </p>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(convo.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div
            className="rounded-xl p-2.5"
            style={{
              background: "rgba(232, 17, 45, 0.06)",
              border: "1px solid rgba(232, 17, 45, 0.12)",
            }}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className="w-3 h-3 shrink-0 mt-0.5"
                style={{ color: "var(--gov-red)" }}
              />
              <p className="text-[10px] leading-relaxed" style={{ color: "var(--gov-red)" }}>
                Information juridique uniquement. Consultez un professionnel du droit.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-3 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gov-green)" }}
            >
              <Scale className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1
                className="text-[13px] font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Code du Numérique
              </h1>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                République du Bénin
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
              Assistant Juridique — Code du Numérique
            </span>
          </div>

          {mounted && (
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Tooltip content="Nouvelle conversation">
                  <Button isIconOnly variant="light" size="sm" onPress={newConversation}>
                    <RotateCcw className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                  </Button>
                </Tooltip>
              )}
              <Tooltip content={theme === "dark" ? "Mode clair" : "Mode sombre"}>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                  ) : (
                    <Moon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                  )}
                </Button>
              </Tooltip>
            </div>
          )}
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-12">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "var(--gov-green)", boxShadow: "var(--shadow-md)" }}
              >
                <Scale className="w-8 h-8 text-white" />
              </div>

              <h2
                className="text-xl font-bold mb-2 tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Interrogez le Code du Numérique
              </h2>
              <p
                className="text-sm mb-10 text-center max-w-lg leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Posez vos questions en langage courant. L&apos;assistant analyse les
                539 articles du Code et vous fournit une réponse claire avec les
                références exactes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl w-full">
                {SUGGESTIONS.map(({ text, icon: Icon }) => (
                  <Card
                    key={text}
                    isPressable
                    onPress={() => send(text)}
                    className="transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <CardBody className="p-3.5 flex-row items-start gap-3">
                      <Icon
                        className="w-4 h-4 shrink-0 mt-0.5"
                        style={{ color: "var(--gov-green)" }}
                      />
                      <p
                        className="text-[12px] leading-relaxed flex-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {text}
                      </p>
                      <ChevronRight
                        className="w-3.5 h-3.5 shrink-0 mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      />
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className="flex gap-3">
                  <Avatar
                    size="sm"
                    className="mt-0.5 shrink-0"
                    style={{
                      background:
                        msg.role === "user"
                          ? "var(--bg-tertiary)"
                          : "var(--gov-green)",
                    }}
                    icon={
                      msg.role === "user" ? (
                        <User className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                      ) : (
                        <Scale className="w-4 h-4 text-white" />
                      )
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[11px] font-semibold mb-1.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {msg.role === "user" ? "Vous" : "Assistant Juridique"}
                    </p>

                    {msg.role === "user" ? (
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {msg.content}
                      </p>
                    ) : (
                      <div
                        className="prose-chat text-[14px]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}

                    {msg.sources && msg.sources.length > 0 && (
                      <Accordion
                        isCompact
                        className="mt-3 px-0"
                        itemClasses={{
                          base: "py-0",
                          title: "text-xs",
                          trigger: "py-2",
                          content: "pb-3",
                        }}
                      >
                        <AccordionItem
                          key="sources"
                          aria-label="Sources"
                          startContent={
                            <BookOpen
                              className="w-3.5 h-3.5"
                              style={{ color: "var(--gov-green)" }}
                            />
                          }
                          title={
                            <span style={{ color: "var(--text-muted)" }}>
                              {msg.sources.length} article
                              {msg.sources.length > 1 ? "s" : ""} de référence
                            </span>
                          }
                        >
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((s, j) => (
                              <Tooltip
                                key={j}
                                content={s.livre?.slice(0, 60) || ""}
                                delay={300}
                              >
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  startContent={
                                    <Sparkles
                                      className="w-3 h-3"
                                      style={{ color: "var(--gov-green)" }}
                                    />
                                  }
                                  style={{
                                    background: "rgba(0, 98, 51, 0.08)",
                                    border: "1px solid rgba(0, 98, 51, 0.15)",
                                    color: "var(--text-accent)",
                                  }}
                                >
                                  Art. {s.article}
                                </Chip>
                              </Tooltip>
                            ))}
                          </div>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {i < messages.length - 1 && (
                      <Divider
                        className="mt-5"
                        style={{ background: "var(--border)" }}
                      />
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <Avatar
                    size="sm"
                    className="mt-0.5 shrink-0"
                    style={{ background: "var(--gov-green)" }}
                    icon={<Scale className="w-4 h-4 text-white" />}
                  />
                  <div className="flex flex-col gap-2 py-2">
                    <p className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
                      Assistant Juridique
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 px-4 pb-4 pt-2" style={{ background: "var(--bg-primary)" }}>
          <div className="max-w-3xl mx-auto">
            <div
              className="flex items-end gap-2 rounded-2xl px-4 py-3"
              style={{ background: "var(--bg-tertiary)" }}
            >
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                    (e.target as HTMLTextAreaElement).style.height = "auto";
                  }
                }}
                placeholder="Décrivez votre situation ou posez votre question juridique..."
                disabled={loading}
                rows={1}
                className="flex-1 resize-none outline-none text-[14px] leading-relaxed"
                style={{
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "none",
                  fontFamily: "inherit",
                }}
              />
              <Button
                isIconOnly
                size="sm"
                onPress={() => send()}
                isLoading={loading}
                isDisabled={!input.trim()}
                className="shrink-0 rounded-xl mb-0.5"
                style={{
                  background: input.trim() ? "var(--gov-green)" : "transparent",
                  color: input.trim() ? "white" : "var(--text-muted)",
                }}
              >
                {!loading && <SendHorizonal className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <AlertTriangle className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Information juridique à titre indicatif — ne constitue pas un avis juridique officiel
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
