import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "fs";

const data = new Uint8Array(fs.readFileSync("public/pdf/loi-2017-20.pdf"));
const doc = await getDocument({ data }).promise;

const mapping = {};

for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  // Join with space to avoid words sticking together
  const text = content.items.map((item) => item.str).join(" ");

  // Broad regex: Article followed by number, with possible spaces/newlines
  const matches = text.matchAll(/Art(?:icle)?\s*(\d+)\s*(?:er|ème|e)?/gi);
  for (const m of matches) {
    const artNum = m[1].trim();
    if (!mapping[artNum]) {
      mapping[artNum] = i;
    }
  }
}

console.log("Pages:", doc.numPages);
console.log("Articles mapped:", Object.keys(mapping).length);

// Check coverage
const articles = JSON.parse(fs.readFileSync("data/code_du_numerique_articles.json", "utf8"));
const uniqueNums = new Set();
articles.forEach(a => {
  const clean = a.article_num.replace(/er.*/, "").replace(/_.*/, "");
  uniqueNums.add(clean);
});
let found = 0;
for (const n of uniqueNums) {
  if (mapping[n]) found++;
}
console.log("Coverage:", found, "/", uniqueNums.size);

fs.writeFileSync("data/article_pages.json", JSON.stringify(mapping, null, 2));
console.log("Saved");
