import { Router, type IRouter } from "express";
import { desc, eq, ne } from "drizzle-orm";
import { db, khutbahsTable } from "@workspace/db";
import {
  ListKhutbahsResponse,
  GetCurrentKhutbahResponse,
  GetKhutbahArchiveResponse,
  GetKhutbahParams,
  GetKhutbahResponse,
  UpdateKhutbahParams,
  UpdateKhutbahBody,
  UpdateKhutbahResponse,
  DeleteKhutbahParams,
  CreateKhutbahBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toApiKhutbah(row: typeof khutbahsTable.$inferSelect) {
  return {
    id: row.id,
    date: row.date.toISOString(),
    isCurrent: row.isCurrent,
    title: { ar: row.titleAr, en: row.titleEn, tr: row.titleTr, fr: row.titleFr, ur: row.titleUr, fa: row.titleFa },
    body: { ar: row.bodyAr, en: row.bodyEn, tr: row.bodyTr, fr: row.bodyFr, ur: row.bodyUr, fa: row.bodyFa },
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/khutbahs", async (req, res): Promise<void> => {
  const rows = await db.select().from(khutbahsTable).orderBy(desc(khutbahsTable.date));
  res.json(ListKhutbahsResponse.parse(rows.map(toApiKhutbah)));
});

router.post("/khutbahs", async (req, res): Promise<void> => {
  const parsed = CreateKhutbahBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;

  // If marking as current, clear all others first
  if (d.isCurrent) {
    await db.update(khutbahsTable).set({ isCurrent: false });
  }

  const [row] = await db
    .insert(khutbahsTable)
    .values({
      date: new Date(d.date),
      isCurrent: d.isCurrent ?? false,
      titleAr: d.titleAr,
      titleEn: d.titleEn,
      titleTr: d.titleTr,
      titleFr: d.titleFr,
      titleUr: d.titleUr,
      titleFa: d.titleFa,
      bodyAr: d.bodyAr,
      bodyEn: d.bodyEn,
      bodyTr: d.bodyTr,
      bodyFr: d.bodyFr,
      bodyUr: d.bodyUr,
      bodyFa: d.bodyFa,
    })
    .returning();

  res.status(201).json(GetKhutbahResponse.parse(toApiKhutbah(row)));
});

router.get("/khutbahs/current", async (req, res): Promise<void> => {
  // Try to find isCurrent=true first, then fall back to most recent
  let [row] = await db
    .select()
    .from(khutbahsTable)
    .where(eq(khutbahsTable.isCurrent, true))
    .limit(1);

  if (!row) {
    const rows = await db
      .select()
      .from(khutbahsTable)
      .orderBy(desc(khutbahsTable.date))
      .limit(1);
    row = rows[0];
  }

  if (!row) {
    res.status(404).json({ error: "No khutbahs found" });
    return;
  }

  res.json(GetCurrentKhutbahResponse.parse(toApiKhutbah(row)));
});

router.get("/khutbahs/archive", async (req, res): Promise<void> => {
  // Get the current one first
  const [current] = await db
    .select()
    .from(khutbahsTable)
    .where(eq(khutbahsTable.isCurrent, true))
    .limit(1);

  let rows;
  if (current) {
    rows = await db
      .select()
      .from(khutbahsTable)
      .where(ne(khutbahsTable.id, current.id))
      .orderBy(desc(khutbahsTable.date));
  } else {
    // Exclude the most recent (that's the "current" by fallback)
    const all = await db.select().from(khutbahsTable).orderBy(desc(khutbahsTable.date));
    rows = all.slice(1);
  }

  res.json(GetKhutbahArchiveResponse.parse(rows.map(toApiKhutbah)));
});

router.get("/khutbahs/:id", async (req, res): Promise<void> => {
  const params = GetKhutbahParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(khutbahsTable).where(eq(khutbahsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Khutbah not found" });
    return;
  }
  res.json(GetKhutbahResponse.parse(toApiKhutbah(row)));
});

router.patch("/khutbahs/:id", async (req, res): Promise<void> => {
  const params = UpdateKhutbahParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateKhutbahBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const d = parsed.data;

  // If marking as current, clear all others first
  if (d.isCurrent === true) {
    await db.update(khutbahsTable).set({ isCurrent: false });
  }

  const updateData: Partial<typeof khutbahsTable.$inferInsert> = {};
  if (d.date !== undefined) updateData.date = new Date(d.date);
  if (d.isCurrent !== undefined) updateData.isCurrent = d.isCurrent;
  if (d.titleAr !== undefined) updateData.titleAr = d.titleAr;
  if (d.titleEn !== undefined) updateData.titleEn = d.titleEn;
  if (d.titleTr !== undefined) updateData.titleTr = d.titleTr;
  if (d.titleFr !== undefined) updateData.titleFr = d.titleFr;
  if (d.titleUr !== undefined) updateData.titleUr = d.titleUr;
  if (d.titleFa !== undefined) updateData.titleFa = d.titleFa;
  if (d.bodyAr !== undefined) updateData.bodyAr = d.bodyAr;
  if (d.bodyEn !== undefined) updateData.bodyEn = d.bodyEn;
  if (d.bodyTr !== undefined) updateData.bodyTr = d.bodyTr;
  if (d.bodyFr !== undefined) updateData.bodyFr = d.bodyFr;
  if (d.bodyUr !== undefined) updateData.bodyUr = d.bodyUr;
  if (d.bodyFa !== undefined) updateData.bodyFa = d.bodyFa;

  const [row] = await db
    .update(khutbahsTable)
    .set(updateData)
    .where(eq(khutbahsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Khutbah not found" });
    return;
  }

  res.json(UpdateKhutbahResponse.parse(toApiKhutbah(row)));
});

router.delete("/khutbahs/:id", async (req, res): Promise<void> => {
  const params = DeleteKhutbahParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(khutbahsTable)
    .where(eq(khutbahsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Khutbah not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
