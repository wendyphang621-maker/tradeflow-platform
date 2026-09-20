import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const deals = sqliteTable("deals", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  customer: text("customer").notNull(),
  product: text("product").notNull(),
  amount: integer("amount").notNull(),
  stage: text("stage").notNull().default("inquiry"),
  next: text("next_action").notNull().default("安排首次联系"),
  owner: text("owner").notNull().default("Wendy"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const companyProfiles = sqliteTable("company_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull().default(""),
  contact: text("contact").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  bankInfo: text("bank_info").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tradeDocuments = sqliteTable("trade_documents", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  type: text("type").notNull(),
  documentNo: text("document_no").notNull(),
  companyProfileId: integer("company_profile_id"),
  sellerJson: text("seller_json").notNull(),
  buyer: text("buyer").notNull(),
  buyerAddress: text("buyer_address").notNull().default(""),
  currency: text("currency").notNull().default("USD"),
  itemsJson: text("items_json").notNull(),
  extraJson: text("extra_json").notNull().default("{}"),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("draft"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customerResearch = sqliteTable("customer_research", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").notNull(),
  company: text("company").notNull(),
  website: text("website").notNull(),
  industry: text("industry").notNull().default("待确认"),
  summary: text("summary").notNull().default(""),
  emails: text("emails").notNull().default(""),
  phones: text("phones").notNull().default(""),
  sourceTitle: text("source_title").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  model: text("model").notNull(),
  category: text("category").notNull().default(""),
  specification: text("specification").notNull().default(""),
  price: integer("price").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
