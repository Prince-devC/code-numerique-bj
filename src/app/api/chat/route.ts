import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type Article = {
  article_num: string;
  title: string;
  content: string;
  char_count: number;
  livre?: string;
  embedding?: number[];
};

// Load embeddings once at startup
const dataPath = path.join(process.cwd(), "data/code_du_numerique_embeddings.json");
const data: Article[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Cosine similarity
function cosineSim(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Get embedding from Mistral
async function getQueryEmbedding(text: string): Promise<number[]> {
  const res = await fetch("https://api.mistral.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({ model: "mistral-embed", input: [text] }),
  });
  const json = await res.json();
  return json.data[0].embedding;
}

// Search by article number
function searchByNumber(query: string): Article[] {
  const match = query.match(/article\s*(\d+)/i);
  if (!match) return [];
  const num = match[1];
  return data.filter(
    (a) => a.article_num === num || a.article_num === num + "er" || a.article_num.startsWith(num + "er_")
  ).slice(0, 8);
}

// Vector search
async function searchByEmbedding(query: string, topK = 5): Promise<Article[]> {
  const queryEmb = await getQueryEmbedding(query);
  const scored = data
    .filter((a) => a.embedding)
    .map((a) => ({ article: a, score: cosineSim(queryEmb, a.embedding!) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  return scored.map((s) => s.article);
}

// Simple in-memory rate limiter
const rateMap = new Map<string, number[]>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateMap.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  if (timestamps.length >= RATE_LIMIT) return true;
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

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ answer: "Clé API manquante.", sources: [] }, { status: 500 });
  }

  // Search: by number first, then by embedding
  let relevant = searchByNumber(message);
  if (relevant.length === 0) {
    relevant = await searchByEmbedding(message);
  }

  const context = relevant.length
    ? relevant
        .map((a) => `[Article ${a.article_num}] (${a.livre || ""})\n${a.content.slice(0, 1500)}`)
        .join("\n\n")
    : "Aucun article spécifique trouvé. Réponds avec tes connaissances générales sur le Code du Numérique du Bénin.";

  const systemPrompt = `Tu es un assistant juridique spécialisé dans le Code du Numérique du Bénin (Loi 2017-20 modifiée par Loi 2020-35).

Règles :
- Réponds en français simple et accessible
- Cite toujours les numéros d'articles exacts quand disponibles
- Donne une explication pratique avec des exemples concrets adaptés au Bénin
- Si la question est une salutation, réponds brièvement et propose des exemples de questions
- Si la question dépasse le Code du Numérique, dis-le clairement
- Termine toujours par : "⚠️ Ceci est une information, pas un avis juridique officiel."

Articles pertinents :
${context}`;

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error("Mistral error:", JSON.stringify(result));
    return NextResponse.json(
      { answer: `Erreur: ${result?.message || "Réessayez."}`, sources: [] },
      { status: 500 }
    );
  }

  const answer = result.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";

  return NextResponse.json({
    answer,
    sources: relevant.map((a) => ({
      article: a.article_num,
      livre: a.livre || "",
      excerpt: a.content.slice(0, 200),
    })),
  });
}
