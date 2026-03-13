import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const pagesPath = path.join(process.cwd(), "data/article_pages.json");
const pages: Record<string, number> = JSON.parse(fs.readFileSync(pagesPath, "utf-8"));

export async function GET(req: NextRequest) {
  const num = req.nextUrl.searchParams.get("num") || "";
  const clean = num.replace(/er.*/, "").replace(/_.*/, "");
  const page = pages[clean] || 1;
  return NextResponse.json({ page });
}
