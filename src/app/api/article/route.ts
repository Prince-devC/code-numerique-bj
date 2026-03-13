import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type Article = { article_num: string; title: string; content: string; livre?: string; titre?: string; chapitre?: string };

const dataPath = path.join(process.cwd(), "data/code_du_numerique_articles.json");
const articles: Article[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

export async function GET(req: NextRequest) {
  const num = req.nextUrl.searchParams.get("num");
  if (!num) return NextResponse.json({ error: "num requis" }, { status: 400 });

  // Find all parts of this article (some are split: 1er_part1, 1er_part2, etc.)
  const found = articles.filter(
    (a) => a.article_num === num || a.article_num.startsWith(num + "_")
  );

  if (found.length === 0) {
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
  }

  // Merge parts into one
  const merged = {
    article_num: num,
    title: found[0].title.replace(/\s*\(partie \d+\/\d+\)/, ""),
    content: found.map((a) => a.content).join("\n\n"),
    livre: found[0].livre || "",
    titre: found[0].titre || "",
    chapitre: found[0].chapitre || "",
  };

  return NextResponse.json(merged);
}
