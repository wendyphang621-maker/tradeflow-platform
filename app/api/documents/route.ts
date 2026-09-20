import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { companyProfiles, tradeDocuments } from "../../../db/schema";

const owner = (request: Request) => request.headers.get("oai-authenticated-user-id") ?? "local_seedy";

export async function GET(request: Request) {
  try {
    const db = getDb();
    const ownerId = owner(request);
    const [profiles, documents] = await Promise.all([
      db.select().from(companyProfiles).where(eq(companyProfiles.ownerId, ownerId)).orderBy(desc(companyProfiles.id)),
      db.select().from(tradeDocuments).where(eq(tradeDocuments.ownerId, ownerId)).orderBy(desc(tradeDocuments.updatedAt)).limit(100),
    ]);
    return Response.json({ profiles, documents: documents.map(d => ({ ...d, seller: JSON.parse(d.sellerJson), items: JSON.parse(d.itemsJson), extra: JSON.parse(d.extraJson) })) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "读取单据失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const db = getDb();
    const ownerId = owner(request);
    if (payload.action === "saveProfile") {
      const name = String(payload.name ?? "").trim();
      if (!name) return Response.json({ error: "公司名称不能为空" }, { status: 400 });
      const [profile] = await db.insert(companyProfiles).values({ ownerId, name, address: String(payload.address ?? ""), contact: String(payload.contact ?? ""), phone: String(payload.phone ?? ""), email: String(payload.email ?? ""), bankInfo: String(payload.bankInfo ?? "") }).returning();
      return Response.json({ profile }, { status: 201 });
    }
    if (payload.action === "saveDocument") {
      const documentNo = String(payload.documentNo ?? "").trim();
      const buyer = String(payload.buyer ?? "").trim();
      const items = Array.isArray(payload.items) ? payload.items : [];
      if (!documentNo || !buyer || !items.length) return Response.json({ error: "单据编号、客户和产品不能为空" }, { status: 400 });
      const id = String(payload.id || `DOC-${Date.now()}`);
      const values = { ownerId, type: String(payload.type ?? "PI"), documentNo, companyProfileId: Number(payload.companyProfileId) || null, sellerJson: JSON.stringify(payload.seller ?? {}), buyer, buyerAddress: String(payload.buyerAddress ?? ""), currency: String(payload.currency ?? "USD"), itemsJson: JSON.stringify(items), extraJson: JSON.stringify(payload.extra ?? {}), notes: String(payload.notes ?? ""), status: "archived", updatedAt: new Date().toISOString() };
      const existing = await db.select({ id: tradeDocuments.id }).from(tradeDocuments).where(eq(tradeDocuments.id, id)).limit(1);
      const [document] = existing.length ? await db.update(tradeDocuments).set(values).where(eq(tradeDocuments.id, id)).returning() : await db.insert(tradeDocuments).values({ id, ...values }).returning();
      return Response.json({ document: { ...document, seller: JSON.parse(document.sellerJson), items: JSON.parse(document.itemsJson), extra: JSON.parse(document.extraJson) } }, { status: 201 });
    }
    return Response.json({ error: "不支持的操作" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 500 });
  }
}
