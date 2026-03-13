import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

const pdfPath = path.join(process.cwd(), "public/pdf/loi-2017-20.pdf");
const pdfBytes = fs.readFileSync(pdfPath);

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
  const range = parseInt(req.nextUrl.searchParams.get("range") || "3", 10);

  const srcDoc = await PDFDocument.load(pdfBytes);
  const totalPages = srcDoc.getPageCount();

  const start = Math.max(0, page - 1);
  const end = Math.min(totalPages, page - 1 + range);

  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(srcDoc, Array.from({ length: end - start }, (_, i) => start + i));
  pages.forEach((p) => newDoc.addPage(p));

  const bytes = await newDoc.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
