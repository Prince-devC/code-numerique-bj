import fs from "fs";

const MISTRAL_API_KEY = "24AEUL2t3q3koodyj3AlQGeULAW1ihaq";
const articles = JSON.parse(fs.readFileSync("data/code_du_numerique_articles.json", "utf-8"));

// Check if we have partial results
let results = [];
if (fs.existsSync("data/code_du_numerique_embeddings_partial.json")) {
  results = JSON.parse(fs.readFileSync("data/code_du_numerique_embeddings_partial.json", "utf-8"));
  console.log(`Resuming from ${results.length}/${articles.length}`);
}

async function getEmbeddings(texts, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch("https://api.mistral.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({ model: "mistral-embed", input: texts }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.data.map((d) => d.embedding);
    }
    if (res.status === 429) {
      const wait = (attempt + 1) * 10;
      console.log(`    Rate limited, waiting ${wait}s...`);
      await new Promise((r) => setTimeout(r, wait * 1000));
    } else {
      const err = await res.json();
      throw new Error(err.message || JSON.stringify(err));
    }
  }
  throw new Error("Max retries exceeded");
}

async function main() {
  const startIdx = results.length;
  console.log(`Generating embeddings for ${articles.length - startIdx} remaining articles...`);
  const batchSize = 5;

  for (let i = startIdx; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    const texts = batch.map(
      (a) => `Article ${a.article_num}: ${a.title}\n${a.content.slice(0, 1000)}`
    );
    const embeddings = await getEmbeddings(texts);
    for (let j = 0; j < batch.length; j++) {
      results.push({ ...batch[j], embedding: embeddings[j] });
    }
    console.log(`  ${Math.min(i + batchSize, articles.length)}/${articles.length}`);
    // Save partial progress
    fs.writeFileSync("data/code_du_numerique_embeddings_partial.json", JSON.stringify(results));
    await new Promise((r) => setTimeout(r, 500));
  }

  fs.writeFileSync("data/code_du_numerique_embeddings.json", JSON.stringify(results));
  fs.unlinkSync("data/code_du_numerique_embeddings_partial.json");
  const size = (fs.statSync("data/code_du_numerique_embeddings.json").size / 1024 / 1024).toFixed(1);
  console.log(`Done! ${results.length} embeddings saved (${size} MB)`);
}

main().catch(console.error);
