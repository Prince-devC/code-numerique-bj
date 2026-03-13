"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const PDFDocument = dynamic(() => import("react-pdf").then((m) => {
  m.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${m.pdfjs.version}/build/pdf.worker.min.mjs`;
  return { default: m.Document };
}), { ssr: false });

const PDFPage = dynamic(() => import("react-pdf").then((m) => ({ default: m.Page })), { ssr: false });

const RANGE = 3;

function PDFViewer() {
  const params = useSearchParams();
  const article = params.get("article") || "";
  const pageParam = params.get("page") || "";

  const [targetPage, setTargetPage] = useState<number | null>(pageParam ? parseInt(pageParam, 10) : null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [width, setWidth] = useState(800);

  // If no page param, fetch it from the mapping
  useEffect(() => {
    if (targetPage) return;
    if (!article) { setTargetPage(1); return; }
    fetch(`/api/article-page?num=${encodeURIComponent(article)}`)
      .then((r) => r.json())
      .then((d) => setTargetPage(d.page || 1))
      .catch(() => setTargetPage(1));
  }, [article, targetPage]);

  useEffect(() => {
    setWidth(Math.min(window.innerWidth - 40, 900));
    const h = () => setWidth(Math.min(window.innerWidth - 40, 900));
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const onLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => setNumPages(n), []);

  if (!targetPage) return (
    <div className="h-dvh flex items-center justify-center" style={{ background: "#525659" }}>
      <Loader2 className="w-8 h-8 animate-spin text-white/50" />
    </div>
  );

  const pdfUrl = `/api/pdf?page=${targetPage}&range=${RANGE}`;
  const displayPage = targetPage + currentPage - 1;

  return (
    <div className="h-dvh flex flex-col" style={{ background: "#525659" }}>
      <div className="flex items-center justify-between px-5 h-12 shrink-0" style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4">
          <Link href="/chat" className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Retour au chat
          </Link>
          {article && (
            <>
              <span className="w-px h-5" style={{ background: "var(--border)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Article {article}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="p-1.5 rounded disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm tabular-nums" style={{ color: "var(--text-primary)" }}>Page {displayPage}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))} disabled={currentPage >= numPages} className="p-1.5 rounded disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <a href="/pdf/loi-2017-20.pdf" download className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
          <Download className="w-3 h-3" /> PDF complet
        </a>
      </div>
      <div className="flex-1 overflow-auto flex justify-center py-4">
        <PDFDocument file={pdfUrl} onLoadSuccess={onLoadSuccess} loading={<Loader2 className="w-8 h-8 animate-spin text-white/50 mt-20" />}>
          <PDFPage pageNumber={currentPage} width={width} renderTextLayer={false} renderAnnotationLayer={false} />
        </PDFDocument>
      </div>
    </div>
  );
}

export default function ViewerPage() {
  return <Suspense><PDFViewer /></Suspense>;
}
