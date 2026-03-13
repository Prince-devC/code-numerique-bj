"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";

type Article = {
  article_num: string;
  title: string;
  content: string;
  livre: string;
  titre: string;
  chapitre: string;
};

function ArticleContent() {
  const params = useSearchParams();
  const num = params.get("num") || "";
  const highlight = params.get("hl") || "";
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const hlRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!num) return;
    fetch(`/api/article?num=${encodeURIComponent(num)}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setArticle(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [num]);

  useEffect(() => {
    if (hlRef.current) {
      setTimeout(() => hlRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  }, [article]);

  const renderContent = (text: string) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase()
        ? <span key={i} ref={i === 1 ? hlRef : undefined} className="px-0.5 rounded" style={{ background: "rgba(0,98,51,0.2)", borderBottom: "2px solid var(--gov-green)" }}>{part}</span>
        : part
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-2" style={{ color: "var(--text-muted)" }}>
      <Loader2 className="w-5 h-5 animate-spin" /> Chargement...
    </div>
  );

  if (error || !article) return (
    <div className="text-center py-20">
      <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Article non trouvé</p>
      <p className="mt-2" style={{ color: "var(--text-muted)" }}>L&apos;article {num} n&apos;existe pas dans la base.</p>
      <Link href="/chat" className="inline-flex items-center gap-2 mt-6 text-sm font-medium" style={{ color: "var(--gov-green)" }}>
        <ArrowLeft className="w-4 h-4" /> Retour au chat
      </Link>
    </div>
  );

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        {article.livre && <span>{article.livre}</span>}
        {article.titre && <><span>/</span><span>{article.titre}</span></>}
        {article.chapitre && <><span>/</span><span>{article.chapitre}</span></>}
      </div>

      {/* Header */}
      <div className="mb-8" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "2rem" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full p-2 shrink-0" style={{ background: "var(--gov-green)" }}>
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--gov-green)" }}>
            Article {article.article_num}
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold lg:tracking-tight" style={{ color: "var(--text-primary)" }}>
          {article.title}
        </h1>
      </div>

      {/* Content */}
      <div className="leading-relaxed text-base whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
        {renderContent(article.content)}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Source : Code du Numérique du Bénin (Loi 2017-20 modifiée par Loi 2020-35)
        </p>
      </div>
    </>
  );
}

export default function ArticlePage() {
  return (
    <div className="min-h-dvh" style={{ background: "var(--bg-primary)" }}>
      {/* Nav */}
      <div className="max-w-screen-xl mx-auto px-5">
        <header className="flex items-center justify-between my-5">
          <Link href="/" className="flex items-center gap-2.5 text-lg">
            <img src="/logo-icon.svg" alt="" className="w-8 h-8 rounded-lg" />
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>mondroit</span>
            <span style={{ color: "var(--text-muted)" }}>.bj</span>
          </Link>
          <Link href="/chat" className="rounded-sm text-center transition px-5 py-2.5 text-sm font-medium text-white" style={{ background: "var(--gov-green)" }}>
            Retour au chat
          </Link>
        </header>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-8 pb-20">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] gap-2" style={{ color: "var(--text-muted)" }}><Loader2 className="w-5 h-5 animate-spin" /> Chargement...</div>}>
          <ArticleContent />
        </Suspense>
      </div>
    </div>
  );
}

function Loader2Icon(props: { className?: string }) {
  return <Loader2 {...props} />;
}
