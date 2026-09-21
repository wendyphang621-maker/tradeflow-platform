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
const focusMap = {
  "手机与消费电子": "关注新品规格、芯片与电池技术，以及主要品牌的价格和发布节奏。",
  "市场与渠道": "关注重点国家需求、分销商变化、零售价格和渠道库存。",
  "物流与供应链": "关注运价、港口时效、关键零部件供应和交付风险。",
  "法规与合规": "关注 CE、FCC、RoHS、产品准入、关税和数据合规变化。",
};
const summaries = sources.map(source => {
  const rows = unique.filter(item => item.category === source.category);
  const headlines = rows.slice(0, 2).map(item => item.title.replace(/\s+-\s+[^-]+$/, ""));
  return {
    category: source.category,
    count: rows.length,
    overview: rows.length ? `今日收录 ${rows.length} 条，重点包括：${headlines.join("；")}。` : "今日暂未收录到新的公开信息。",
    focus: focusMap[source.category] ?? "关注与业务相关的价格、需求和政策变化。",
  };
});
const payload = JSON.stringify({ updatedAt: new Date().toISOString(), summaries, items: unique }, null, 2) + "\n";
for (const target of ["github-pages/public/data/industry-news.json", "docs/data/industry-news.json"]) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, payload);
}
console.log(`Saved ${unique.length} industry items.`);
