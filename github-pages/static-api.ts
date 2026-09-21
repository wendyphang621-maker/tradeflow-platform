type Json = Record<string, unknown>;
const originalFetch = window.fetch.bind(window);
const read = <T>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) ?? "") as T; } catch { return fallback; }
};
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
const requestBody = async (init?: RequestInit) => init?.body ? JSON.parse(String(init.body)) as Json : {};

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const url = new URL(raw, location.href);
  if (!url.pathname.startsWith("/api/")) return originalFetch(input, init);
  const method = (init?.method ?? "GET").toUpperCase();

  if (url.pathname.endsWith("/api/deals")) {
    const key = "tradeflow.github.deals", deals = read<any[]>(key, []);
    if (method === "GET") return json({ deals });
    const body = await requestBody(init);
    if (method === "POST") {
      const deal = { id: `OP-${Date.now().toString().slice(-8)}`, customer: String(body.customer ?? ""), product: String(body.product ?? ""), amount: Number(body.amount) || 0, stage: "inquiry", next: "安排首次跟进", owner: "Wendy", createdAt: new Date().toISOString() };
      write(key, [deal, ...deals]); return json({ deal }, 201);
    }
    if (method === "PATCH") {
      const changed = deals.map(item => item.id === body.id ? { ...item, stage: body.stage } : item);
      write(key, changed); return json({ deal: changed.find(item => item.id === body.id) });
    }
  }

  if (url.pathname.endsWith("/api/business-data")) {
    const customerKey = "tradeflow.github.customers", productKey = "tradeflow.github.products";
    const customers = read<any[]>(customerKey, []), products = read<any[]>(productKey, []);
    if (method === "GET") return json({ customers, products });
    const body = await requestBody(init), action = String(body.action ?? "");
    if (action === "discoverLeads") {
      const keyword = String(body.keyword ?? "").trim(), region = String(body.region ?? "").trim();
      const q = encodeURIComponent(`${keyword} ${region} distributor importer company`);
      return json({ leads: [
        { id: `lead-${Date.now()}-1`, company: `${keyword} distributor search`, website: `https://www.google.com/search?q=${q}`, industry: keyword || "综合贸易", summary: "打开搜索结果，找到目标公司后把官网复制到下方进行存档。" },
        { id: `lead-${Date.now()}-2`, company: `${keyword} importer search`, website: `https://www.bing.com/search?q=${q}`, industry: keyword || "综合贸易", summary: "GitHub 版本通过公开搜索页发现新客户。" },
      ] });
    }
    if (action === "researchCustomer") {
      const website = String(body.website ?? "");
      const normalized = /^https?:/i.test(website) ? website : `https://${website}`;
      const host = (() => { try { return new URL(normalized).hostname; } catch { return website; } })();
      const customer = { id: Date.now(), company: String(body.company ?? "").trim() || host, website: normalized, industry: "待补充", summary: "已从公开官网录入，请按实际业务补充行业与联系方式。", emails: "", phones: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      write(customerKey, [customer, ...customers]); return json({ customer }, 201);
    }
    if (action === "importCustomer") {
      const website = String(body.website ?? ""), normalized = website && !/^https?:/i.test(website) ? `https://${website}` : website;
      const customer = { id: Date.now()+Math.floor(Math.random()*1000), company: String(body.company ?? "").trim() || normalized || "未命名客户", website: normalized, industry: String(body.industry ?? "综合贸易"), summary: String(body.summary ?? "采集线索导入"), emails: String(body.emails ?? ""), phones: String(body.phones ?? ""), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      write(customerKey, [customer, ...customers]); return json({ customer }, 201);
    }
    if (action === "refreshCustomers") return json({ updated: 0, total: customers.length });
    if (action === "saveProduct") {
      const id = Number(body.id) || Date.now();
      const product = { id, name: String(body.name ?? ""), model: String(body.model ?? ""), category: String(body.category ?? ""), specification: String(body.specification ?? ""), price: Math.round(Number(body.price) * 100) || 0, currency: String(body.currency ?? "USD"), status: "active" };
      write(productKey, [product, ...products.filter(item => item.id !== id)]); return json({ product }, 201);
    }
    if (action === "deleteProduct") { write(productKey, products.filter(item => item.id !== Number(body.id))); return json({ ok: true }); }
  }

  if (url.pathname.endsWith("/api/documents")) {
    const profileKey = "tradeflow.github.profiles", documentKey = "tradeflow.github.documents";
    const profiles = read<any[]>(profileKey, []), documents = read<any[]>(documentKey, []);
    if (method === "GET") return json({ profiles, documents });
    const body = await requestBody(init);
    if (body.action === "saveProfile") {
      const profile = { id: Date.now(), name: String(body.name ?? ""), address: String(body.address ?? ""), contact: String(body.contact ?? ""), phone: String(body.phone ?? ""), email: String(body.email ?? ""), bankInfo: String(body.bankInfo ?? "") };
      write(profileKey, [profile, ...profiles]); return json({ profile }, 201);
    }
    if (body.action === "saveDocument") {
      const id = String(body.id || `DOC-${Date.now()}`), document = { ...body, id, updatedAt: new Date().toISOString() };
      write(documentKey, [document, ...documents.filter(item => item.id !== id)]); return json({ document }, 201);
    }
  }
  return json({ error: "GitHub 本地数据接口不支持此操作" }, 400);
};
