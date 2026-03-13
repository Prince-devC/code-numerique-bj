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

export type ChatResponse = {
  answer: string;
  sources: { article: string; livre: string; excerpt: string; page?: number }[];
};

const dataPath = path.join(process.cwd(), "data/code_du_numerique_embeddings.json");
const data: Article[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

const pagesPath = path.join(process.cwd(), "data/article_pages.json");
const articlePages: Record<string, number> = JSON.parse(fs.readFileSync(pagesPath, "utf-8"));

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

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

function searchByNumber(query: string): Article[] {
  const match = query.match(/article\s*(\d+)/i);
  if (!match) return [];
  const num = match[1];
  return data.filter(
    (a) => a.article_num === num || a.article_num === num + "er" || a.article_num.startsWith(num + "er_")
  ).slice(0, 8);
}

async function searchByEmbedding(query: string, topK = 5): Promise<Article[]> {
  const queryEmb = await getQueryEmbedding(query);
  return data
    .filter((a) => a.embedding)
    .map((a) => ({ article: a, score: cosineSim(queryEmb, a.embedding!) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.article);
}

export async function processMessage(message: string): Promise<ChatResponse> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return { answer: "Clé API manquante.", sources: [] };

  let relevant = searchByNumber(message);
  if (relevant.length === 0) {
    relevant = await searchByEmbedding(message);
  }

  const context = relevant.length
    ? relevant.map((a) => `[Article ${a.article_num}] (${a.livre || ""})\n${a.content.slice(0, 1500)}`).join("\n\n")
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
    return { answer: "Erreur du service. Réessayez.", sources: [] };
  }

  return {
    answer: result.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.",
    sources: relevant.map((a) => ({
      article: a.article_num,
      livre: a.livre || "",
      excerpt: a.content.slice(0, 200),
      page: articlePages[a.article_num.replace(/er.*/, "").replace(/_.*/, "")] || undefined,
    })),
  };
}
