import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";
import {
  GetSettingsResponse,
  UpdateSettingsBody,
  UpdateSettingsResponse,
  VerifyAdminPasswordBody,
  VerifyAdminPasswordResponse,
  ChangeAdminPasswordBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateSettings() {
  const rows = await db.select().from(settingsTable).limit(1);
  if (rows.length > 0) return rows[0];
  const [row] = await db.insert(settingsTable).values({
    adminPasswordHash: "admin123",
    aboutAr: "موقع خطب الجمعة الجامعية",
    aboutEn: "University Friday Prayer Sermon Website",
    aboutTr: "Üniversite Cuma Hutbesi Sitesi",
    aboutFr: "Site des sermons du vendredi de l'université",
    aboutUr: "یونیورسٹی جمعہ خطبہ ویب سائٹ",
    aboutFa: "وب‌سایت خطبه نماز جمعه دانشگاه",
  }).returning();
  return row;
}

function toApiSettings(row: typeof settingsTable.$inferSelect) {
  return {
    id: row.id,
    aboutAr: row.aboutAr,
    aboutEn: row.aboutEn,
    aboutTr: row.aboutTr,
    aboutFr: row.aboutFr,
    aboutUr: row.aboutUr,
    aboutFa: row.aboutFa,
  };
}

router.get("/settings", async (req, res): Promise<void> => {
  const settings = await getOrCreateSettings();
  res.json(GetSettingsResponse.parse(toApiSettings(settings)));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const settings = await getOrCreateSettings();
  const d = parsed.data;

  const updateData: Partial<typeof settingsTable.$inferInsert> = {};
  if (d.aboutAr !== undefined) updateData.aboutAr = d.aboutAr;
  if (d.aboutEn !== undefined) updateData.aboutEn = d.aboutEn;
  if (d.aboutTr !== undefined) updateData.aboutTr = d.aboutTr;
  if (d.aboutFr !== undefined) updateData.aboutFr = d.aboutFr;
  if (d.aboutUr !== undefined) updateData.aboutUr = d.aboutUr;
  if (d.aboutFa !== undefined) updateData.aboutFa = d.aboutFa;

  const [updated] = await db
    .update(settingsTable)
    .set(updateData)
    .where(eq(settingsTable.id, settings.id))
    .returning();

  res.json(UpdateSettingsResponse.parse(toApiSettings(updated)));
});

router.post("/admin/verify", async (req, res): Promise<void> => {
  const parsed = VerifyAdminPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const settings = await getOrCreateSettings();
  const valid = parsed.data.password === settings.adminPasswordHash;

  if (!valid) {
    res.status(401).json(VerifyAdminPasswordResponse.parse({ valid: false }));
    return;
  }

  res.json(VerifyAdminPasswordResponse.parse({ valid: true }));
});

router.patch("/admin/password", async (req, res): Promise<void> => {
  const parsed = ChangeAdminPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const settings = await getOrCreateSettings();

  if (parsed.data.currentPassword !== settings.adminPasswordHash) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }

  await db
    .update(settingsTable)
    .set({ adminPasswordHash: parsed.data.newPassword })
    .where(eq(settingsTable.id, settings.id));

  res.json({ success: true });
});

export default router;
