import fs from "fs";
const patterns = JSON.parse(fs.readFileSync(new URL("./patterns.json", import.meta.url)));

export function retrievePatterns(text, topK = 2) {
  const lower = text.toLowerCase();
  return patterns
    .map((p) => ({ p, hits: p.keywords.filter((k) => lower.includes(k)).length }))
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, topK)
    .map((x) => x.p);
}