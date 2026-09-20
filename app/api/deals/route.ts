import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { deals } from "../../../db/schema";

const allowedStages = new Set(["inquiry", "contacted", "quoted", "sample", "negotiation", "won"]);
const userId = (request: Request) => request.headers.get("oai-authenticated-user-id") ?? "local_seedy";

export async function GET(request: Request) {
  try {
    const rows = await getDb().select().from(deals).where(eq(deals.ownerId, userId(request))).orderBy(asc(deals.createdAt));
    return Response.json({ deals: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "读取商机失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { customer?: string; product?: string; amount?: number };
    const customer = body.customer?.trim() ?? "";
    const product = body.product?.trim() ?? "";
    const amount = Math.round(Number(body.amount));
    if (!customer || !product || !Number.isFinite(amount) || amount <= 0) return Response.json({ error: "客户、产品和有效金额不能为空" }, { status: 400 });
    const id = `OP-${Date.now().toString().slice(-8)}`;
    const [deal] = await getDb().insert(deals).values({ id, ownerId: userId(request), customer, product, amount }).returning();
    return Response.json({ deal }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "新增商机失败" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as { id?: string; stage?: string };
    if (!body.id || !body.stage || !allowedStages.has(body.stage)) return Response.json({ error: "商机编号或阶段无效" }, { status: 400 });
    const [deal] = await getDb().update(deals).set({ stage: body.stage }).where(and(eq(deals.id, body.id), eq(deals.ownerId, userId(request)))).returning();
    if (!deal) return Response.json({ error: "未找到商机" }, { status: 404 });
    return Response.json({ deal });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "更新商机失败" }, { status: 500 });
  }
}
