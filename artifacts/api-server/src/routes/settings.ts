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
    reminderAr: "عن أبي هريرة رضي الله عنه أن رسول الله صلى الله عليه وسلم قال: «إِذَا قُلْتَ لِصَاحِبِكَ يَوْمَ الْجُمُعَةِ: أَنْصِتْ، وَالإِمَامُ يَخْطُبُ، فَقَدْ لَغَوْتَ» (متفق عليه). وفي رواية مسلم: «من توضأ فأحسن الوضوء ثم أتى الجمعة، فاستمع وأنصت، غفر له ما بينه وبين الجمعة وزيادة ثلاثة أيام، ومن مس الحصى فقد لغا». ومعنى ذلك أنه عند دخول المسجد، يجب ألا ينشغل المصلي عن سماع الخطبة بأي شيء كالكلام أو اللعب بالهاتف ونحوه. يرجى إغلاق الهاتف أو وضعه على الصامت، وتجنب لمسه أو الانشغال به طوال فترة الخطبة.",
    reminderEn: "The Prophet (ﷺ) said: \"If you say to your companion on Friday: 'Listen quietly' while the Imam is delivering the sermon, then you have spoken/distracted yourself.\" (Agreed upon). In another narration: \"Whoever performs wudu' and performs it well, then comes to Jumu'ah, listens and remains quiet, his sins between that Jumu'ah and the next will be forgiven, with an addition of three days. And whoever touches the pebbles has distracted himself.\" (Muslim).\nThis means when you enter the mosque, you should not occupy yourself with anything like talking or playing with your phone. Please silence or turn off your phone, and avoid touching or interacting with it during the sermon.",
    reminderTr: "Resûlullah (s.a.v.) şöyle buyurmuştur: \"Cuma günü imam hutbe okurken arkadaşına 'Sus!' dahi dersen, boş ve lüzumsuz bir iş yapmış (hutbe sevabını azaltmış) olursun.\" (Buhari ve Müslim). Müslim'in diğer rivayetinde: \"Kim güzelce abdest alır, Cuma namazına gelir, hutbeyi sessizce dinlerse, iki Cuma arasındaki ve buna ilave olarak üç günlük günahları bağışlanır. Kim de camideki çakıl taşlarıyla oynarsa lüzumsuz iş yapmış olur.\" denilmiştir.\nBu, mescide girdiğinizde konuşmak veya telefonla oynamak gibi hutbe dinlemeyi engelleyecek şeylerle meşgul olmamanız gerektiği anlamına gelir. Lütfen telefonunuzu sessize alın veya kapatın, hutbe sırasında telefonunuza dokunmaktan kaçının.",
    reminderFr: "Le Prophète (ﷺ) a dit : \"Si tu dis à ton compagnon le vendredi : 'Écoute silencieusement' pendant que l'imam prononce le sermon, alors tu as parlé/distrait toi-même.\" (Buhari et Muslim). Dans une autre version : \"Celui qui fait ses ablutions de manière parfaite, puis se rend au vendredi, écoute et reste silencieux, on lui pardonne ce qu'il y a entre ce vendredi et le suivant, avec trois jours en plus. Et celui qui touche les cailloux a fait une distraction.\" (Muslim).\nCela signifie que lorsque vous entrez dans la mosquée, vous ne devez pas vous occuper avec des choses comme parler ou jouer avec votre téléphone. Veuillez éteindre ou mettre votre téléphone sous silence, et évitez de l'utiliser pendant le sermon.",
    reminderUr: "رسول اللہ (ﷺ) نے فرمایا: \"جب جمعہ کے دن امام خطبہ دے رہا ہو اور تم اپنے ساتھی سے کہو کہ 'خاموش رہو'، تو تم نے لغو کام کیا۔\" (متفق علیہ)۔ ایک اور روایت میں ہے: \"جس نے اچھی طرح وضو کیا، پھر جمعہ کے لیے آیا، غور سے خطبہ سنا اور خاموش رہا، تو اس کے اس جمعہ سے لے کر دوسرے جمعہ تک اور مزید تین دن کے گناہ معاف کر دیے جاتے ہیں، اور جس نے کنکریوں کو چھوا اس نے لغو کام کیا۔\" (موقف علیہ، مسلم)\nاس کا مطلب یہ ہے کہ جب آپ مسجد میں داخل ہوں تو اپنے آپ کو بات چیت کرنے یا اپنے فون کے ساتھ کھیلنے جیسے کاموں میں مشغول نہ کریں۔ براہ کرم اپنے فون کو خاموش یا بند کر دیں اور خطبہ کے دوران اسے چھونے یا استعمال کرنے سے گریز کریں۔",
    reminderFa: "پیامبر اکرم (ص) فرمودند: \"اگر در روز جمعه، در حالی که امام خطبه می‌خواند، به دوست خود بگویی: 'ساکت باش'، بیهوده‌گویی کرده‌ای (و از ثواب خطبه محروم شده‌ای).\" (متفق علیه). در روایت دیگری آمده است: \"هر کس وضو بگیرد و آن را به خوبی انجام دهد، سپس به نماز جمعه بیاید و گوش فرا دهد و سکوت کند، گناهان او میان این جمعه و جمعه آینده، و سه روز بیشتر بخشیده می‌شود و هر کس سنگریزه‌ها را لمس کند، بیهوده‌گویی کرده است.\" (مسلم).\nاین بدان معناست که هنگام ورود به مسجد، نباید خود را به کارهایی مانند صحبت کردن یا بازی با تلفن همراه مشغول کنید. لطفاً تلفن خود را سایلنت یا خاموش کنید و در طول خطبه از استفاده از آن خودداری کنید.",
    reminderTitleAr: "مهم : اقرأني",
    reminderTitleEn: "Important Notice",
    reminderTitleTr: "Önemli Uyarı",
    reminderTitleFr: "Avis Important",
    reminderTitleUr: "اہم نوٹس",
    reminderTitleFa: "تذکر مهم",
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
    reminderAr: row.reminderAr,
    reminderEn: row.reminderEn,
    reminderTr: row.reminderTr,
    reminderFr: row.reminderFr,
    reminderUr: row.reminderUr,
    reminderFa: row.reminderFa,
    reminderTitleAr: row.reminderTitleAr,
    reminderTitleEn: row.reminderTitleEn,
    reminderTitleTr: row.reminderTitleTr,
    reminderTitleFr: row.reminderTitleFr,
    reminderTitleUr: row.reminderTitleUr,
    reminderTitleFa: row.reminderTitleFa,
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
  if (d.reminderAr !== undefined) updateData.reminderAr = d.reminderAr;
  if (d.reminderEn !== undefined) updateData.reminderEn = d.reminderEn;
  if (d.reminderTr !== undefined) updateData.reminderTr = d.reminderTr;
  if (d.reminderFr !== undefined) updateData.reminderFr = d.reminderFr;
  if (d.reminderUr !== undefined) updateData.reminderUr = d.reminderUr;
  if (d.reminderFa !== undefined) updateData.reminderFa = d.reminderFa;
  if (d.reminderTitleAr !== undefined) updateData.reminderTitleAr = d.reminderTitleAr;
  if (d.reminderTitleEn !== undefined) updateData.reminderTitleEn = d.reminderTitleEn;
  if (d.reminderTitleTr !== undefined) updateData.reminderTitleTr = d.reminderTitleTr;
  if (d.reminderTitleFr !== undefined) updateData.reminderTitleFr = d.reminderTitleFr;
  if (d.reminderTitleUr !== undefined) updateData.reminderTitleUr = d.reminderTitleUr;
  if (d.reminderTitleFa !== undefined) updateData.reminderTitleFa = d.reminderTitleFa;

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
