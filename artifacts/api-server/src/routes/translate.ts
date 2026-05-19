import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import {
  TranslateKhutbahBody,
  TranslateKhutbahResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getAdminPassword(): Promise<string> {
  const rows = await db.select().from(settingsTable).limit(1);
  return rows[0]?.adminPasswordHash ?? "admin123";
}

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || text.trim().length === 0) return "";
  
  // Split into lines/paragraphs to respect the layout and avoid Google URL size limit (5000 chars)
  const paragraphs = text.split("\n");
  
  const translatedParagraphs = await Promise.all(
    paragraphs.map(async (paragraph) => {
      const trimmed = paragraph.trim();
      if (trimmed.length === 0) return "";
      
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Google Translate API returned status ${response.status}`);
        }
        const json = (await response.json()) as any;
        if (!json || !Array.isArray(json[0])) {
          throw new Error("Invalid response format from Google Translate API");
        }
        return json[0].map((item: any) => item[0] || "").join("").trim();
      } catch (err) {
        console.error(`Translation to ${targetLang} failed for paragraph: "${trimmed.slice(0, 30)}..."`, err);
        return trimmed; // fallback to original paragraph if translation fails
      }
    })
  );
  
  return translatedParagraphs.join("\n");
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

  try {
    const [
      enTitle, enBody,
      trTitle, trBody,
      frTitle, frBody,
      urTitle, urBody,
      faTitle, faBody
    ] = await Promise.all([
      translateText(titleAr, "en"),
      translateText(bodyAr, "en"),
      translateText(titleAr, "tr"),
      translateText(bodyAr, "tr"),
      translateText(titleAr, "fr"),
      translateText(bodyAr, "fr"),
      translateText(titleAr, "ur"),
      translateText(bodyAr, "ur"),
      translateText(titleAr, "fa"),
      translateText(bodyAr, "fa"),
    ]);

    const translations = {
      titleEn: enTitle,
      bodyEn: enBody,
      titleTr: trTitle,
      bodyTr: trBody,
      titleFr: frTitle,
      bodyFr: frBody,
      titleUr: urTitle,
      bodyUr: urBody,
      titleFa: faTitle,
      bodyFa: faBody,
    };

    const validationResult = TranslateKhutbahResponse.safeParse(translations);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error, "Parsed JSON:", translations);
      res.status(500).json({ error: "Translation failed: unexpected response shape" });
      return;
    }

    res.json(validationResult.data);
  } catch (error) {
    console.error("Translation logic error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Translation failed due to server error" });
  }
});

export default router;
