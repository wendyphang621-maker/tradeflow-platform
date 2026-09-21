import fs from "node:fs/promises";
import path from "node:path";

const sources = JSON.parse(await fs.readFile("industry-sources.json", "utf8"));
const decode = (value = "") => value.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const value = (block, tag) => decode(block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] ?? "");
const items = [];

for (const source of sources) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(source.query)}&hl=en-US&gl=US&ceid=US:en`;
  try {
    const response = await fetch(url, { headers: { "user-agent": "TradeFlow-Industry-Update/1.0" } });
    if (!response.ok) continue;
    const xml = await response.text();
    for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
      const block = match[1], title = value(block, "title"), link = value(block, "link"), published = value(block, "pubDate"), sourceName = value(block, "source"), summary = value(block, "description");
      if (title && link) items.push({ title, link, source: sourceName || "Google News", published, category: source.category, summary: summary.slice(0, 260) });
    }
  } catch { /* Keep other sources when one feed is unavailable. */ }
}

const unique = [...new Map(items.map(item => [item.link, item])).values()]
  .sort((a, b) => Date.parse(b.published) - Date.parse(a.published)).slice(0, 80);
const payload = JSON.stringify({ updatedAt: new Date().toISOString(), items: unique }, null, 2) + "\n";
for (const target of ["github-pages/public/data/industry-news.json", "docs/data/industry-news.json"]) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, payload);
}
console.log(`Saved ${unique.length} industry items.`);
