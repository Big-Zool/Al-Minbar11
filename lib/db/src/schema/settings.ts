import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  adminPasswordHash: text("admin_password_hash").notNull().default("admin123"),
  aboutAr: text("about_ar").notNull().default(""),
  aboutEn: text("about_en").notNull().default(""),
  aboutTr: text("about_tr").notNull().default(""),
  aboutFr: text("about_fr").notNull().default(""),
  aboutUr: text("about_ur").notNull().default(""),
  aboutFa: text("about_fa").notNull().default(""),
  reminderAr: text("reminder_ar").notNull().default(""),
  reminderEn: text("reminder_en").notNull().default(""),
  reminderTr: text("reminder_tr").notNull().default(""),
  reminderFr: text("reminder_fr").notNull().default(""),
  reminderUr: text("reminder_ur").notNull().default(""),
  reminderFa: text("reminder_fa").notNull().default(""),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
