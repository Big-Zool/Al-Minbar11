import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const khutbahsTable = pgTable("khutbahs", {
  id: serial("id").primaryKey(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  isCurrent: boolean("is_current").notNull().default(false),
  titleAr: text("title_ar").notNull().default(""),
  titleEn: text("title_en").notNull().default(""),
  titleTr: text("title_tr").notNull().default(""),
  titleFr: text("title_fr").notNull().default(""),
  titleUr: text("title_ur").notNull().default(""),
  titleFa: text("title_fa").notNull().default(""),
  bodyAr: text("body_ar").notNull().default(""),
  bodyEn: text("body_en").notNull().default(""),
  bodyTr: text("body_tr").notNull().default(""),
  bodyFr: text("body_fr").notNull().default(""),
  bodyUr: text("body_ur").notNull().default(""),
  bodyFa: text("body_fa").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertKhutbahSchema = createInsertSchema(khutbahsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertKhutbah = z.infer<typeof insertKhutbahSchema>;
export type Khutbah = typeof khutbahsTable.$inferSelect;
