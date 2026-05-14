import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import {
  TranslateKhutbahBody,
  TranslateKhutbahResponse,
} from "@workspace/api-zod";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router: IRouter = Router();

async function getAdminPassword(): Promise<string> {
  const rows = await db.select().from(settingsTable).limit(1);
  return rows[0]?.adminPasswordHash ?? "admin123";
}

router.post("/translate", async (req, res): Promise<void> => {
  const parsed = TranslateKhutbahBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Verify admin password before translating
  const adminPassword = await getAdminPassword();
  if (parsed.data.adminPassword !== adminPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { titleAr, bodyAr } = parsed.data;

  const prompt = `You are an expert Islamic scholar and translator. Translate the following Arabic Friday sermon (khutbah) content into English, Turkish, French, Urdu, and Farsi/Persian.

Important guidelines:
- Preserve the religious tone and terminology
- Keep Arabic terms like "الله", "رسول", "صلى الله عليه وسلم" in their original form or with appropriate honorifics
- Urdu and Farsi translations should use their respective scripts (Nastaliq for Urdu, Persian script for Farsi)
- Maintain the formal, reverential style appropriate for a Friday sermon

Arabic Title: ${titleAr}

Arabic Body:
${bodyAr}

Respond ONLY with a valid JSON object in this exact format, no markdown, no explanation:
{
  "titleEn": "...",
  "titleTr": "...",
  "titleFr": "...",
  "titleUr": "...",
  "titleFa": "...",
  "bodyEn": "...",
  "bodyTr": "...",
  "bodyFr": "...",
  "bodyUr": "...",
  "bodyFa": "..."
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((b: { type: string }) => b.type === "text") as { type: "text"; text: string } | undefined;
  if (!textBlock) {
    res.status(500).json({ error: "Translation failed: no text response" });
    return;
  }

  let translations: unknown;
  try {
    translations = JSON.parse(textBlock.text);
  } catch {
    res.status(500).json({ error: "Translation failed: invalid JSON response" });
    return;
  }

  const result = TranslateKhutbahResponse.safeParse(translations);
  if (!result.success) {
    res.status(500).json({ error: "Translation failed: unexpected response shape" });
    return;
  }

  res.json(result.data);
});

export default router;
