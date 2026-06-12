import { useState, useEffect } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AdminPanel } from "@/components/AdminPanel";
import { Language, isRTL, formatDate, getLocale } from "@/lib/language";
import { useGetSettings, useGetCurrentKhutbah, useListKhutbahs } from "@workspace/api-client-react";
import type { Khutbah } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type View = "khutbah" | "archive" | "about";

const langLabels: Record<Language, string> = {
  ar: "العربية", en: "English", tr: "Türkçe", fr: "Français", ur: "اردو", fa: "فارسی"
};

const viewLabels: Record<View, Record<Language, string>> = {
  khutbah: {
    ar: "الخطبة",
    en: "Khutbah",
    tr: "Hutbe",
    fr: "Khoutbah",
    ur: "خطبہ",
    fa: "خطبه"
  },
  archive: {
    ar: "الأرشيف",
    en: "Archive",
    tr: "Arşiv",
    fr: "Archives",
    ur: "آرکائیو",
    fa: "آرشیو"
  },
  about: {
    ar: "عن الموقع",
    en: "About",
    tr: "Hakkımızda",
    fr: "À propos",
    ur: "تعارف",
    fa: "درباره ما"
  },
};

const footerTranslations: Record<"privacy" | "terms" | "contact", Record<Language, string>> = {
  privacy: {
    ar: "سياسة الخصوصية",
    en: "Privacy Policy",
    tr: "Gizlilik Politikası",
    fr: "Politique de confidentialité",
    ur: "رازداری کی پالیسی",
    fa: "حریم خصوصی",
  },
  terms: {
    ar: "شروط الاستخدام",
    en: "Terms of Use",
    tr: "Kullanım Koşulları",
    fr: "Conditions d'utilisation",
    ur: "استعمال کی شرائط",
    fa: "شرایط استفاده",
  },
  contact: {
    ar: "تواصل معنا",
    en: "Contact Us",
    tr: "Bize Ulaşın",
    fr: "Contactez-nous",
    ur: "ہم سے رابطہ کریں",
    fa: "تماس با ما",
  },
};

const policyContents: Record<"privacy" | "terms", Record<Language, string>> = {
  privacy: {
    ar: "موقع منبر الجمعة يحترم خصوصيتكم. نحن لا نجمع أو نخزن أي بيانات شخصية من زوارنا. ملفات تعريف الارتباط (Cookies) تُستخدم فقط لحفظ خيارات اللغة المفضلة محلياً على جهازكم.",
    en: "Al-Minbar Sermons website respects your privacy. We do not collect, share, or store any personal data from our visitors. Cookies are only used locally to save your language preference.",
    tr: "Al-Minbar Vaazları web sitesi gizliliğinize saygı duyar. Ziyaretçilerimizden herhangi bir kişisel veri toplamıyoruz, paylaşmıyoruz veya saklamıyoruz. Çerezler yalnızca dil tercihinizi yerel olarak kaydetmek için kullanılır.",
    fr: "Le site Al-Minbar respecte votre vie privée. Nous ne collectons, ne partageons ni ne stockons aucune donnée personnelle de nos visiteurs. Les cookies sont uniquement utilisés localement pour enregistrer vos préférences de langue.",
    ur: "منبر الجمعہ ویب سائٹ آپ کی پرائیویسی کا احترام کرتی ہے۔ ہم اپنے زائرین سے کوئی ذاتی معلومات جمع، شیئر یا محفوظ نہیں کرتے ہیں۔ کوکیز صرف مقامی طور پر آپ کی زبان کی ترجیح کو محفوظ کرنے کے لیے استعمال ہوتی ہیں۔",
    fa: "وب‌سایت منبر جمعه به حریم خصوصی شما احترام می‌گذارد. ما هیچ‌گونه داده شخصی از بازدیدکنندگان خود جمع‌آوری، اشتراک‌گذاری یا ذخیره نمی‌کنیم. کوکی‌ها فقط برای ذخیره تنظیمات زبان شما به صورت محلی استفاده می‌شوند.",
  },
  terms: {
    ar: "المحتوى المنشور على منبر الجمعة مخصص للاستخدام الشخصي والتعليمي والدعوي. يرجى الإشارة إلى المصدر عند مشاركة أو نقل النصوص. الاستخدام التجاري غير مصرح به بدون إذن خطي مسبق.",
    en: "The content published on Al-Minbar is intended for personal, educational, and spiritual use. Please credit the source when sharing or quoting. Commercial use is unauthorized without prior written permission.",
    tr: "Al-Minbar'da yayınlanan içerikler kişisel, eğitimsel ve manevi kullanım içindir. Lütfen paylaşırken veya alıntı yaparken kaynağı belirtin. Önceden yazılı izin alınmadan ticari amaçla kullanılması yasaktır.",
    fr: "Le contenu publié sur Al-Minbar est destiné à un usage personnel, éducatif et spirituel. Veuillez citer la source lors du partage ou de la citation. L'utilisation commerciale n'est pas autorisée sans autorisation écrite préalable.",
    ur: "منبر پر شائع ہونے والا مواد ذاتی، تعلیمی اور روحانی استعمال کے لیے ہے۔ براہ کرم شیئر کرتے یا حوالہ دیتے وقت ماخذ کا ذکر کریں۔ پیشگی تحریری اجازت کے بغیر تجارتی استعمال کی اجازت نہیں ہے۔",
    fa: "مطالب منتشر شده در منبر جمعه برای استفاده شخصی، آموزشی و معنوی در نظر گرفته شده است. لطفاً هنگام اشتراک‌گذاری یا نقل قول، منبع را ذکر کنید. استفاده تجاری بدون اجازه کتبی قبلی مجاز نیست.",
  },
};

const uiTranslations: Record<string, Record<Language, string>> = {
  brandName: {
    ar: "المنبر",
    en: "Al-Minbar",
    tr: "Al-Minbar",
    fr: "Al-Minbar",
    ur: "المنبر",
    fa: "المنبر"
  },
  searchSermons: {
    ar: "بحث في الخطب...",
    en: "Search sermons...",
    tr: "Hutbelerde ara...",
    fr: "Rechercher des sermons...",
    ur: "خطبات تلاش کریں...",
    fa: "جستجو در خطبه‌ها..."
  },
  fridayPulpit: {
    ar: "منبر الجمعة",
    en: "The Friday Pulpit",
    tr: "Cuma Minberi",
    fr: "La Chaire du Vendredi",
    ur: "جمعہ کا منبر",
    fa: "منبر جمعه"
  },
  sidebarDesc: {
    ar: "موقع خطب الجمعة للجامعة — نشر خطب الإمام الأسبوعية بست لغات لجميع أبناء المجتمع.",
    en: "Al-Minbar serves as a sanctuary for reflection and spiritual growth. Preserving the wisdom of the Friday Khutbah for all.",
    tr: "Al-Minbar, yansıma ve ruhsal büyüme için bir sığınak görevi görür. Cuma Hutbesi'nin hikmetini herkes için korur.",
    fr: "Al-Minbar sert de sanctuaire pour la réflexion et la croissance spirituelle. Préserver la sagesse de la Khoutbah du vendredi pour tous.",
    ur: "المنبر فکر اور روحانی ترقی کا ایک مرکز ہے۔ سب کے لیے خطبہ جمعہ کی حکمت کو محفوظ کرنا۔",
    fa: "المنبر به عنوان پناهگاهی برای تفکر و رشد معنوی عمل می‌کند. حفظ حکمت خطبه جمعه برای همه."
  },
  weeklyWisdom: {
    ar: "حكمة أسبوعية",
    en: "Weekly Wisdom",
    tr: "Haftalık Hikmet",
    fr: "Sagesse Hebdomadaire",
    ur: "ہفتہ وار حکمت",
    fa: "حکمت هفتگی"
  },
  weeklyWisdomDesc: {
    ar: "خطب مختارة بعناية كل جمعة",
    en: "Carefully curated sermons every Jumu'ah.",
    tr: "Her Cuma özenle seçilmiş hutbeler.",
    fr: "Sermons soigneusement sélectionnés chaque Jumu'ah.",
    ur: "ہر جمعہ کو احتیاط سے منتخب کردہ خطبات۔",
    fa: "خطبه‌های با دقت انتخاب شده در هر جمعه."
  },
  globalReach: {
    ar: "انتشار عالمي",
    en: "Global Reach",
    tr: "Küresel Erişim",
    fr: "Portée Globale",
    ur: "عالمی رسائی",
    fa: "گسترش جهانی"
  },
  globalReachDesc: {
    ar: "ترجمات بست لغات للجميع",
    en: "Translations in 6 languages for inclusivity.",
    tr: "Kapsayıcılık için 6 dilde çeviri.",
    fr: "Des traductions en 6 langues pour l'inclusivité.",
    ur: "شمولیت کے لیے 6 زبانوں میں ترجمہ۔",
    fa: "ترجمه به ۶ زبان برای فراگیری بیشتر."
  },
  currentFeature: {
    ar: "خطبة اليوم",
    en: "Current Feature",
    tr: "Günün Hutbesi",
    fr: "À la Une",
    ur: "آج کی خاص خصوصیت",
    fa: "ویژگی فعلی"
  },
  todaysKhutbah: {
    ar: "خطبة اليوم",
    en: "Today's Khutbah",
    tr: "Bugünün Hutbesi",
    fr: "Khoutbah d'aujourd'hui",
    ur: "آج کا خطبہ",
    fa: "خطبه امروز"
  },
  copyText: {
    ar: "نسخ",
    en: "Copy",
    tr: "Kopyala",
    fr: "Copier",
    ur: "کاپی کریں",
    fa: "کپی"
  },
  copiedText: {
    ar: "تم النسخ",
    en: "Copied",
    tr: "Kopyalandı",
    fr: "Copie effectuée",
    ur: "کاپی ہو گیا",
    fa: "کپی شد"
  },
  copyFull: {
    ar: "نسخ نص الخطبة كاملاً",
    en: "Copy Full Sermon",
    tr: "Tüm Hutbeyi Kopyala",
    fr: "Copier le sermon complet",
    ur: "مکمل خطبہ کاپی کریں",
    fa: "کپی متن کامل خطبه"
  },
  copiedFull: {
    ar: "تم نسخ نص الخطبة",
    en: "Sermon Copied",
    tr: "Hutbe Kopyalandı",
    fr: "Sermon copié",
    ur: "خطبہ کاپی ہو گیا",
    fa: "خطبه کپی شد"
  },
  noCurrent: {
    ar: "لا توجد خطبة حالية",
    en: "No current khutbah available.",
    tr: "Şu anda güncel hutbe bulunmamaktadır.",
    fr: "Aucune khoutbah disponible pour le moment.",
    ur: "فی الحال کوئی خطبہ دستیاب نہیں ہے۔",
    fa: "در حال حاضر هیچ خطبه‌ای در دسترس نیست."
  },
  weeklySermons: {
    ar: "خطب الجمعة الأسبوعية",
    en: "Weekly Friday Sermons",
    tr: "Haftalık Cuma Hutbeleri",
    fr: "Sermons hebdomadaires du vendredi",
    ur: "ہفتہ وار جمعہ کے خطبات",
    fa: "خطبه‌های هفتگی جمعه"
  },
  archiveLabel: {
    ar: "الأرشيف",
    en: "Archive",
    tr: "Arşiv",
    fr: "Archives",
    ur: "آرکائیو",
    fa: "آرشیو"
  },
  aboutUs: {
    ar: "عن الموقع",
    en: "About Us",
    tr: "Hakkımızda",
    fr: "À propos de nous",
    ur: "ہمارے بارے میں",
    fa: "درباره ما"
  },
  archiveTitle: {
    ar: "أرشيف الخطب",
    en: "Khutbah Archive",
    tr: "Hutbe Arşivi",
    fr: "Archives des Khoutbahs",
    ur: "خطبات کا آرکائیو",
    fa: "آرشیو خطبه‌ها"
  },
  archiveSubtitle: {
    ar: "تصفح مجموعة خطب الجمعة السابقة",
    en: "Browse our collection of past Friday sermons.",
    tr: "Geçmiş Cuma hutbeleri koleksiyonumuza göz atın.",
    fr: "Parcourez notre collection de sermons de vendredi passés.",
    ur: "پچھلے جمعہ کے خطبات کا ہمارا مجموعہ دیکھیں۔",
    fa: "مجموعه خطبه‌های گذشته جمعه را مرور کنید."
  },
  archiveSearchPlaceholder: {
    ar: "البحث حسب الموضوع أو العنوان...",
    en: "Search by topic or title...",
    tr: "Konu veya başlığa göre ara...",
    fr: "Rechercher par sujet ou titre...",
    ur: "موضوع یا عنوان سے تلاش کریں...",
    fa: "جستجو بر اساس موضوع یا عنوان..."
  },
  noResults: {
    ar: "لا توجد نتائج",
    en: "No sermons found.",
    tr: "Hutbe bulunamadı.",
    fr: "Aucun sermon trouvé.",
    ur: "کوئی خطبہ نہیں ملا۔",
    fa: "هیچ خطبه‌ای پیدا نشد."
  },
  read: {
    ar: "اقرأ",
    en: "Read",
    tr: "Oku",
    fr: "Lire",
    ur: "پڑھیں",
    fa: "بخوانید"
  },
  aboutTitle: {
    ar: "عن منبر الجمعة",
    en: "About Al-Minbar",
    tr: "Al-Minbar Hakkında",
    fr: "À propos d'Al-Minbar",
    ur: "المنبر کے بارے میں",
    fa: "درباره المنبر"
  },
  aboutDesc: {
    ar: "موقع خطب الجمعة للجامعة — نشر خطب الإمام الأسبوعية بست لغات لجميع أبناء المجتمع.",
    en: "Al-Minbar is the University Friday Prayer website, publishing the Imam's weekly sermons in six languages to serve the entire community.",
    tr: "Al-Minbar, tüm topluma hizmet etmek için İmam'ın haftalık hutbelerini altı dilde yayınlayan Üniversite Cuma Namazı web sitesidir.",
    fr: "Al-Minbar est le site Web de la prière du vendredi de l'Université, publiant les sermons hebdomadaires de l'Imam en six langues pour servir toute la communauté.",
    ur: "المنبر یونیورسٹی کی نماز جمعہ کی ویب سائٹ ہے، جو پوری کمیونٹی کی خدمت کے لیے امام کے ہفتہ وار خطبات کو چھ زبانوں میں شائع کرتی ہے۔",
    fa: "المنبر وب‌سایت نماز جمعه دانشگاه است که خطبه‌های هفتگی امام را به شش زبان برای خدمت به کل جامعه منتشر می‌کند."
  },
  sixLanguages: {
    ar: "٦ لغات",
    en: "6 Languages",
    tr: "6 Dil",
    fr: "6 Langues",
    ur: "6 زبانیں",
    fa: "۶ زبان"
  },
  sixLanguagesSub: {
    ar: "عربي، إنجليزي، تركي، فرنسي، أردو، فارسي",
    en: "Arabic, English, Turkish, French, Urdu, Farsi",
    tr: "Arapça, İngilizce, Türkçe, Fransızca, Urduca, Farsça",
    fr: "Arabe, Anglais, Turc, Français, Ourdou, Persan",
    ur: "عربی، انگریزی، ترکی، فرانسیسی، اردو، فارسی",
    fa: "عربی، انگلیسی، ترکی، فرانسوی، اردو، فارسی"
  },
  weeklyUpdates: {
    ar: "أسبوعياً",
    en: "Weekly Updates",
    tr: "Haftalık Güncellemeler",
    fr: "Mises à jour hebdomadaires",
    ur: "ہفتہ وار اپڈیٹس",
    fa: "بروزرسانی‌های هفتگی"
  },
  weeklyUpdatesSub: {
    ar: "خطبة جديدة كل جمعة",
    en: "A new khutbah every Friday",
    tr: "Her Cuma yeni bir hutbe",
    fr: "Une nouvelle khoutbah chaque vendredi",
    ur: "ہر جمعہ کو ایک نیا خطبہ",
    fa: "یک خطبه جدید هر جمعه"
  },
  contactWithMe: {
    ar: "تواصل معي",
    en: "Contact with me",
    tr: "Benimle iletişime geçin",
    fr: "Contactez-moi",
    ur: "مجھ سے رابطہ کریں",
    fa: "با من تماس بگیرید"
  },
  portfolio: {
    ar: "الموقع الشخصي",
    en: "Portfolio",
    tr: "Portföy",
    fr: "Portfolio",
    ur: "پورٹ فولیو",
    fa: "پورتفولیو"
  },
  footerTagline: {
    ar: "رفع الرسالة، تثبيت القلب",
    en: "Elevating the message, anchoring the heart.",
    tr: "Mesajı yüceltmek, kalbi sabitlemek.",
    fr: "Élever le message, ancrer le cœur.",
    ur: "پیغام کو بلند کرنا، دل کو مضبوط کرنا۔",
    fa: "برافراشتن پیام، استوار ساختن دل."
  },
  close: {
    ar: "إغلاق",
    en: "Close",
    tr: "Kapat",
    fr: "Fermer",
    ur: "بند کریں",
    fa: "بستن"
  },
  dismiss: {
    ar: "موافق",
    en: "Dismiss",
    tr: "Kapat",
    fr: "Fermer",
    ur: "خارج کریں",
    fa: "رد کردن"
  },
  adminButton: {
    ar: "الإدارة",
    en: "Admin",
    tr: "Yönetici",
    fr: "Admin",
    ur: "ایڈمن",
    fa: "مدیریت"
  },
  adminLogin: {
    ar: "دخول الإدارة",
    en: "Admin Login",
    tr: "Yönetici Girişi",
    fr: "Connexion Admin",
    ur: "ایڈمن لاگ ان",
    fa: "ورود مدیر"
  },
  adminConsoleDesc: {
    ar: "أدخل كلمة المرور للوصول إلى لوحة التحكم.",
    en: "Enter your password to access the admin console.",
    tr: "Yönetici paneline erişmek için şifrenizi girin.",
    fr: "Entrez votre mot de passe pour accéder à la console d'administration.",
    ur: "ایڈمن کنسول تک رسائی کے لیے اپنا پاس ورڈ درج کریں۔",
    fa: "برای دسترسی به پنل مدیریت رمز عبور خود را وارد کنید."
  },
  passwordLabel: {
    ar: "كلمة المرور",
    en: "Password",
    tr: "Şifre",
    fr: "Mot de passe",
    ur: "پاس ورڈ",
    fa: "رمز عبور"
  },
  invalidPassword: {
    ar: "كلمة مرور غير صحيحة. يرجى المحاولة مرة أخرى.",
    en: "Invalid password. Please try again.",
    tr: "Geçersiz şifre. Lütfen tekrar deneyin.",
    fr: "Mot de passe invalide. Veuillez réessayer.",
    ur: "غلط پاس ورڈ۔ براہ کرم دوبارہ کوشش کریں۔",
    fa: "رمز عبور نامعتبر است. لطفاً دوباره تلاش کنید."
  },
  cancel: {
    ar: "إلغاء",
    en: "Cancel",
    tr: "İptal",
    fr: "Annuler",
    ur: "منسوخ کریں",
    fa: "لغو"
  },
  signIn: {
    ar: "تسجيل الدخول",
    en: "Sign In",
    tr: "Giriş Yap",
    fr: "Se connecter",
    ur: "سائن ان کریں",
    fa: "ورود"
  },
  phoneAlertButton: {
    ar: "تنبيه: صمت هاتفك",
    en: "Reminder: Silence your phone",
    tr: "Hatırlatma: Telefonunuzu sessize alın",
    fr: "Rappel : Silencieux sur votre téléphone",
    ur: "تنبہ: اپنا فون خاموش رکھیں",
    fa: "تذکر: تلفن خود را سایلنت کنید"
  },
  phoneAlertTitle: {
    ar: "آداب الحضور",
    en: "Etiquette of Attendance",
    tr: "Katılım Adabı",
    fr: "Étiquette de Présence",
    ur: "حاضری کے آداب",
    fa: "آداب حضور"
  },
  phoneAlertButtonClose: {
    ar: "تم، جزاك الله خيراً",
    en: "Understood, Jazakallah Khair",
    tr: "Anlaşıldı, Cezâkellâhü Hayran",
    fr: "Compris, Jazakallah Khair",
    ur: "ٹھیک ہے، جزاک اللہ خیرا",
    fa: "فهمیدم، جزاک الله خیراً"
  },
  phoneAlertWarningFooter: {
    ar: "الرجاء جعل هاتفك في وضع الصامت",
    en: "Please make your phone silent",
    tr: "Lütfen telefonunuzu sessize alın",
    fr: "Veuillez mettre votre téléphone en mode silencieux",
    ur: "براہ کرم اپنے فون کو خاموش رکھیں",
    fa: "لطفاً تلفن همراه خود را بی‌صدا کنید"
  }
};

function AdminLoginModal({ onLogin, lang }: { onLogin: (password: string) => void; lang: Language }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const res = (await response.json()) as { valid: boolean };
      if (res.valid) {
        onLogin(password);
        setOpen(false);
        setPassword("");
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-body flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:bg-[#f0ece4]"
        style={{ color: "#74796e" }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
        {uiTranslations.adminButton[lang]}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(46,50,48,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm mx-4 rounded-2xl p-8 shadow-2xl" style={{ background: "#faf6f0", border: "1px solid #c4c8bc" }}>
        <h2 className="font-headline text-2xl font-bold mb-1" style={{ color: "#2e3230" }}>{uiTranslations.adminLogin[lang]}</h2>
        <p className="font-body text-sm mb-6" style={{ color: "#74796e" }}>{uiTranslations.adminConsoleDesc[lang]}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="font-body text-sm font-semibold" style={{ color: "#4a7c59" }}>{uiTranslations.passwordLabel[lang]}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-none font-body"
              style={{ background: "#f0ece4" }}
              autoFocus
            />
            {error && <p className="font-body text-xs" style={{ color: "#b83230" }}>{uiTranslations.invalidPassword[lang]}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setOpen(false); setError(false); setPassword(""); }}
              className="flex-1 py-2.5 rounded-xl font-body font-semibold text-sm transition-colors"
              style={{ background: "#f0ece4", color: "#4a7c59" }}
            >
              {uiTranslations.cancel[lang]}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-body font-bold text-sm transition-colors"
              style={{ background: "#4a7c59", color: "#ffffff" }}
            >
              {uiTranslations.signIn[lang]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Home() {
  const [lang, setLang] = useState<Language | null>(() => {
    const saved = localStorage.getItem("minbar_lang") as Language;
    return saved || null;
  });
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [view, setView] = useState<View>("khutbah");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKhutbah, setSelectedKhutbah] = useState<Khutbah | null>(null);
  const [copied, setCopied] = useState(false);
  const [activePolicy, setActivePolicy] = useState<"privacy" | "terms" | null>(null);
  const [showPhoneReminderModal, setShowPhoneReminderModal] = useState(false);

  const handleCopy = () => {
    if (!currentKhutbah || !lang) return;
    const title = currentKhutbah.title[lang as keyof typeof currentKhutbah.title] || currentKhutbah.title.ar;
    const body = currentKhutbah.body[lang as keyof typeof currentKhutbah.body] || currentKhutbah.body.ar;
    const textToCopy = `${title}\n\n${body}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (lang) {
      localStorage.setItem("minbar_lang", lang);
      document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const { data: settings } = useGetSettings();
  const { data: currentKhutbah, isLoading: loadingCurrent } = useGetCurrentKhutbah();
  const { data: khutbahs } = useListKhutbahs();

  if (!lang) return <LanguageSelector onSelect={setLang} />;

  const rtl = isRTL(lang);
  const aboutText = settings?.[`about${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof typeof settings] as string;
  const currentTitle =
    currentKhutbah?.title[lang as keyof typeof currentKhutbah.title] ||
    currentKhutbah?.title.ar;
  const currentBody =
    currentKhutbah?.body[lang as keyof typeof currentKhutbah.body] ||
    currentKhutbah?.body.ar;
  const archive = khutbahs?.filter((k) => k.id !== currentKhutbah?.id) || [];
  const filteredArchive = archive.filter((k) => {
    if (!searchQuery) return true;
    const title = k.title[lang as keyof typeof k.title] || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const navLabel = (key: View) => viewLabels[key][lang] || viewLabels[key].en;

  return (
    <div className="min-h-screen flex flex-col font-body" style={{ background: "#faf6f0", color: "#2e3230" }} dir={rtl ? "rtl" : "ltr"}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 shadow-sm" style={{ background: "#f5f1ea", borderBottom: "1px solid #e4e0d8" }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-headline text-xl font-bold" style={{ color: "#4a7c59" }}>
            <span className="material-symbols-outlined" style={{ color: "#4a7c59", fontSize: 22, fontVariationSettings: "'FILL' 1" }}>mosque</span>
            {uiTranslations.brandName[lang]}
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {(["khutbah", "archive", "about"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-1.5 rounded-full font-body text-sm font-semibold transition-all"
                style={view === v
                  ? { background: "#4a7c59", color: "#ffffff" }
                  : { color: "#4a4e4a", background: "transparent" }
                }
              >
                {navLabel(v)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute top-1/2 -translate-y-1/2 pointer-events-none" style={{ fontSize: 16, color: "#74796e", left: rtl ? "auto" : 10, right: rtl ? 10 : "auto" }}>search</span>
              <input
                className="font-body text-sm rounded-full border-none outline-none py-2 w-44 lg:w-56"
                style={{ background: "#f0ece4", paddingLeft: rtl ? 12 : 32, paddingRight: rtl ? 32 : 12, color: "#2e3230" }}
                placeholder={uiTranslations.searchSermons[lang]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setLang(null)}
              className="p-2 rounded-full transition-colors font-body text-sm font-semibold"
              style={{ color: "#74796e", background: "#f0ece4" }}
              title="Change language"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>language</span>
            </button>
            <AdminLoginModal onLogin={setAdminPassword} lang={lang} />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 px-4 pb-3">
          {(["khutbah", "archive", "about"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex-1 py-1.5 rounded-full font-body text-xs font-semibold transition-all"
              style={view === v
                ? { background: "#4a7c59", color: "#ffffff" }
                : { color: "#4a4e4a", background: "#f0ece4" }
              }
            >
              {navLabel(v)}
            </button>
          ))}
        </div>
      </header>

      {/* ── Today's Khutbah ── */}
      {view === "khutbah" && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left sidebar - order-2 on mobile so article appears first */}
            <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
              <div className="rounded-2xl p-7" style={{ background: "#f5f1ea", border: "1px solid rgba(196,200,188,0.4)" }}>
                <h2 className="font-headline text-2xl font-bold mb-3" style={{ color: "#4a7c59" }}>
                  {uiTranslations.fridayPulpit[lang]}
                </h2>
                <p className="font-body text-sm leading-relaxed mb-6" style={{ color: "#4a4e4a" }}>
                  {aboutText || uiTranslations.sidebarDesc[lang]}
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#c8e8d0" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#4a7c59" }}>auto_stories</span>
                    </div>
                    <div>
                      <h4 className="font-body font-bold text-sm" style={{ color: "#2e3230" }}>
                        {uiTranslations.weeklyWisdom[lang]}
                      </h4>
                      <p className="font-body text-xs" style={{ color: "#74796e" }}>
                        {uiTranslations.weeklyWisdomDesc[lang]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#f8e0a8" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#705c30" }}>translate</span>
                    </div>
                    <div>
                      <h4 className="font-body font-bold text-sm" style={{ color: "#2e3230" }}>
                        {uiTranslations.globalReach[lang]}
                      </h4>
                      <p className="font-body text-xs" style={{ color: "#74796e" }}>
                        {uiTranslations.globalReachDesc[lang]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </aside>

            {/* Right: parchment article - order-1 on mobile */}
            <article className="lg:col-span-8 order-1 lg:order-2">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <span className="font-body text-xs font-bold uppercase tracking-widest" style={{ color: "#705c30" }}>
                    {uiTranslations.currentFeature[lang]}
                  </span>
                  <h1 className="font-headline text-4xl md:text-5xl font-bold mt-1" style={{ color: "#2e3230" }}>
                    {uiTranslations.todaysKhutbah[lang]}
                  </h1>
                </div>
              </div>

              {/* Phone Silence Alert Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowPhoneReminderModal(true)}
                  className="w-full group relative overflow-hidden transition-all duration-300 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow active:scale-95"
                  style={{
                    background: "rgba(74, 124, 89, 0.08)",
                    border: "1px solid rgba(74, 124, 89, 0.2)",
                    color: "#2a6038"
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white p-2 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: "#4a7c59" }}>
                      <span className="material-symbols-outlined text-[18px]">notifications_paused</span>
                    </div>
                    <span className="font-body font-bold text-sm">
                      {uiTranslations.phoneAlertButton[lang]}
                    </span>
                  </div>
                  <span className="material-symbols-outlined opacity-60 transition-transform duration-300 group-hover:translate-x-[-4px]" style={{ transform: rtl ? "rotate(180deg)" : "none" }}>chevron_right</span>
                </button>
              </div>

              {loadingCurrent ? (
                <div className="parchment-card rounded-2xl p-10 space-y-4">
                  <div className="h-6 w-48 rounded-full animate-pulse mx-auto" style={{ background: "#e4e0d8" }} />
                  <div className="h-10 w-3/4 rounded-lg animate-pulse mx-auto" style={{ background: "#e4e0d8" }} />
                  <div className="h-px w-16 mx-auto" style={{ background: "#c4a66a" }} />
                  <div className="space-y-3 pt-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-4 rounded animate-pulse" style={{ background: "#e4e0d8", width: i === 4 ? "60%" : "100%" }} />)}
                  </div>
                </div>
              ) : currentKhutbah ? (
                <div className="parchment-card rounded-2xl relative overflow-hidden p-6 sm:p-10 md:p-12">
                  <div className="absolute top-4 left-4 opacity-15 pointer-events-none">
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#c4a66a" }}>filter_vintage</span>
                  </div>
                  <div className="absolute top-4 right-4 opacity-15 pointer-events-none">
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#c4a66a" }}>filter_vintage</span>
                  </div>

                  <header className="text-center mb-10 relative">
                    <div className="flex justify-between items-center mb-4">
                      {/* Left space for alignment balance on desktop */}
                      <div className="w-20 hidden sm:block" />
                      
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-body text-xs font-bold" style={{ background: "#f8e0a8", color: "#554020" }}>
                        {formatDate(currentKhutbah.date, lang)}
                      </div>

                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-semibold border transition-all active:scale-95 shadow-sm hover:shadow"
                        style={{ border: "1px solid #c4c8bc", color: "#4a7c59", background: "#f5f1ea" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>content_copy</span>
                        {copied ? uiTranslations.copiedText[lang] : uiTranslations.copyText[lang]}
                      </button>
                    </div>
                    
                    <h2 className="font-headline text-2xl md:text-3xl font-bold italic leading-snug mb-5" style={{ color: "#4a7c59" }}>
                      {currentTitle}
                    </h2>
                    <div className="w-20 h-0.5 mx-auto" style={{ background: "rgba(196,166,106,0.5)" }} />
                  </header>

                  <div className="font-body text-base leading-relaxed space-y-5" style={{ color: "#4a4e4a" }}>
                    {currentBody?.split("\n\n").map((para, i) => (
                      <p key={i} className={i === 0 ? "drop-cap" : ""}>
                        {para}
                      </p>
                    ))}
                  </div>

                  <footer className="mt-12 pt-8 text-center" style={{ borderTop: "1px solid rgba(196,166,106,0.3)" }}>
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined" style={{ fontSize: 28, color: "#4a7c59" }}>eco</span>
                      <button
                        onClick={handleCopy}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-body text-sm font-bold border transition-all active:scale-95 shadow-sm hover:shadow"
                        style={{ border: "1px solid #c4c8bc", color: "#ffffff", background: "#4a7c59" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>content_copy</span>
                        {copied ? uiTranslations.copiedFull[lang] : uiTranslations.copyFull[lang]}
                      </button>
                    </div>
                  </footer>
                </div>
              ) : (
                <div className="parchment-card rounded-2xl p-16 text-center">
                  <span className="material-symbols-outlined mb-4 block" style={{ fontSize: 48, color: "#c4c8bc" }}>menu_book</span>
                  <p className="font-body" style={{ color: "#74796e" }}>
                    {uiTranslations.noCurrent[lang]}
                  </p>
                </div>
              )}
            </article>
          </div>
        </main>
      )}

      {/* ── Archive ── */}
      {view === "archive" && (
        <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
          <aside className="hidden md:block w-full md:w-56 flex-shrink-0">
            <div className="rounded-2xl p-5 sticky top-24" style={{ background: "#f0ece4" }}>
              <div className="mb-5 px-2">
                <h2 className="font-headline text-base font-bold" style={{ color: "#4a7c59" }}>{uiTranslations.brandName[lang]}</h2>
                <p className="font-body text-xs" style={{ color: "#74796e" }}>
                  {uiTranslations.weeklySermons[lang]}
                </p>
              </div>
              <nav className="space-y-1">
                {[
                  { icon: "menu_book", label: uiTranslations.todaysKhutbah[lang], action: () => setView("khutbah") },
                  { icon: "history", label: uiTranslations.archiveLabel[lang], active: true },
                  { icon: "info", label: uiTranslations.aboutUs[lang], action: () => setView("about") },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all font-body text-sm font-medium"
                    style={item.active
                      ? { background: "#4a7c59", color: "#ffffff" }
                      : { color: "#4a4e4a" }
                    }
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: item.active ? "#ffffff" : "#74796e" }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <section className="flex-grow">
            <div className="mb-8">
              <h1 className="font-headline text-3xl font-bold" style={{ color: "#2e3230" }}>
                {uiTranslations.archiveTitle[lang]}
              </h1>
              <p className="font-body text-sm mt-2" style={{ color: "#74796e" }}>
                {uiTranslations.archiveSubtitle[lang]}
              </p>
            </div>

            <div className="relative mb-8">
              <span className="material-symbols-outlined absolute top-1/2 -translate-y-1/2" style={{ fontSize: 18, color: "#74796e", left: rtl ? "auto" : 14, right: rtl ? 14 : "auto" }}>search</span>
              <input
                className="w-full font-body text-sm rounded-2xl border py-3 outline-none"
                style={{ paddingLeft: rtl ? 14 : 44, paddingRight: rtl ? 44 : 14, background: "#ffffff", borderColor: "#c4c8bc", color: "#2e3230" }}
                placeholder={uiTranslations.archiveSearchPlaceholder[lang]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredArchive.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined mb-3 block" style={{ fontSize: 48, color: "#c4c8bc" }}>search_off</span>
                <p className="font-body" style={{ color: "#74796e" }}>
                  {uiTranslations.noResults[lang]}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredArchive.map((k) => {
                  const title = k.title[lang as keyof typeof k.title] || k.title.ar;
                  const body = k.body[lang as keyof typeof k.body] || k.body.ar;
                  const excerpt = body?.slice(0, 100) + "...";
                  const month = new Date(k.date).toLocaleDateString(getLocale(lang), { month: "long", year: "numeric" }).toUpperCase();
                  return (
                    <div
                      key={k.id}
                      onClick={() => setSelectedKhutbah(k)}
                      className="archive-card rounded-2xl p-6 flex flex-col justify-between min-h-52 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div>
                        <p className="font-body text-xs font-bold tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
                          {month}
                        </p>
                        <h3 className="font-headline text-lg font-bold leading-snug mb-3" style={{ color: "#ffffff" }}>
                          {title}
                        </h3>
                        <p className="font-body text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                          {excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                        <span className="font-body text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                          {new Date(k.date).toLocaleDateString(getLocale(lang))}
                        </span>
                        <span className="font-body text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff" }}>
                          {uiTranslations.read[lang]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── About ── */}
      {view === "about" && (
        <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <span className="material-symbols-outlined mb-4 block" style={{ fontSize: 48, color: "#4a7c59", fontVariationSettings: "'FILL' 1" }}>mosque</span>
            <h1 className="font-headline text-4xl font-bold" style={{ color: "#2e3230" }}>
              {uiTranslations.aboutTitle[lang]}
            </h1>
          </div>
          <div className="parchment-card rounded-2xl p-10">
            <p className="font-body text-base leading-relaxed" style={{ color: "#4a4e4a" }}>
              {aboutText || uiTranslations.aboutDesc[lang]}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: "translate", label: uiTranslations.sixLanguages[lang], sub: uiTranslations.sixLanguagesSub[lang] },
                { icon: "calendar_month", label: uiTranslations.weeklyUpdates[lang], sub: uiTranslations.weeklyUpdatesSub[lang] },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-5" style={{ background: "#f0ece4" }}>
                  <span className="material-symbols-outlined mb-2 block" style={{ fontSize: 24, color: "#4a7c59" }}>{item.icon}</span>
                  <h4 className="font-body font-bold text-sm" style={{ color: "#2e3230" }}>{item.label}</h4>
                  <p className="font-body text-xs mt-1" style={{ color: "#74796e" }}>{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl p-6" style={{ background: "#f0ece4", border: "1px solid rgba(196,200,188,0.4)" }}>
              <h3 className="font-body font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "#4a7c59" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
                {uiTranslations.contactWithMe[lang]}
              </h3>
              <div className="space-y-3">
                <a href="mailto:bashmohandes04@gmail.com" className="flex items-center gap-3 font-body text-sm hover:text-[#4a7c59] transition-colors" style={{ color: "#4a4e4a" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#74796e" }}>mail</span>
                  bashmohandes04@gmail.com
                </a>
                <a href="https://instagram.com/kpzlz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-body text-sm hover:text-[#4a7c59] transition-colors" style={{ color: "#4a4e4a" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#74796e" }}>link</span>
                  Instagram: @kpzlz
                </a>
                <a href="https://big-zool.github.io/portfolio" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-body text-sm hover:text-[#4a7c59] transition-colors" style={{ color: "#4a4e4a" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#74796e" }}>web</span>
                  {uiTranslations.portfolio[lang]}
                </a>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="mt-16" style={{ borderTop: "1px solid #e4e0d8", background: "#f0ece4" }}>
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="font-headline text-lg font-bold" style={{ color: "#705c30" }}>{uiTranslations.brandName[lang]}</div>
            <p className="font-body text-xs" style={{ color: "#74796e" }}>
              {uiTranslations.footerTagline[lang]}
            </p>
          </div>
          <div className="flex gap-6 font-body text-xs" style={{ color: "#74796e" }}>
            <button
              onClick={() => setActivePolicy("privacy")}
              className="hover:text-[#4a7c59] transition-colors"
            >
              {footerTranslations.privacy[lang]}
            </button>
            <button
              onClick={() => setActivePolicy("terms")}
              className="hover:text-[#4a7c59] transition-colors"
            >
              {footerTranslations.terms[lang]}
            </button>
            <button
              onClick={() => setView("about")}
              className="hover:text-[#4a7c59] transition-colors"
            >
              {footerTranslations.contact[lang]}
            </button>
          </div>
          <p className="font-body text-xs" style={{ color: "#74796e" }}>
            © 2026 Al-Minbar Sermons.
          </p>
        </div>
      </footer>

      {selectedKhutbah && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
          style={{ background: "rgba(46,50,48,0.5)", backdropFilter: "blur(6px)" }}
          onClick={() => setSelectedKhutbah(null)}
        >
          <div
            className="parchment-card rounded-2xl relative w-full max-w-3xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 p-5 sm:p-8 md:p-10"
            style={{ color: "#2e3230" }}
            onClick={(e) => e.stopPropagation()}
            dir={rtl ? "rtl" : "ltr"}
          >
            {/* Top Vintage Ornaments */}
            <div className="absolute top-4 left-4 opacity-15 pointer-events-none">
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#c4a66a" }}>filter_vintage</span>
            </div>
            <div className="absolute top-4 right-4 opacity-15 pointer-events-none">
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#c4a66a" }}>filter_vintage</span>
            </div>

            {/* Close Button in corner */}
            <button
              onClick={() => setSelectedKhutbah(null)}
              className="absolute top-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
              style={{ [rtl ? "left" : "right"]: "1rem", border: "1px solid rgba(196,166,106,0.3)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#74796e" }}>close</span>
            </button>

            {/* Header / Meta */}
            <header className="text-center mb-8 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 font-body text-xs font-bold" style={{ background: "#f8e0a8", color: "#554020" }}>
                {formatDate(selectedKhutbah.date, lang)}
              </div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold italic leading-snug mb-5 px-6" style={{ color: "#4a7c59" }}>
                {selectedKhutbah.title[lang as keyof typeof selectedKhutbah.title] || selectedKhutbah.title.ar}
              </h2>
              <div className="w-20 h-0.5 mx-auto" style={{ background: "rgba(196,166,106,0.5)" }} />
            </header>

            {/* Scrollable Body Text */}
            <div className="font-body text-base leading-relaxed space-y-5 overflow-y-auto pr-2" style={{ color: "#4a4e4a" }}>
              {(selectedKhutbah.body[lang as keyof typeof selectedKhutbah.body] || selectedKhutbah.body.ar)?.split("\n\n").map((para: string, i: number) => (
                <p key={i} className={i === 0 ? "drop-cap" : ""}>
                  {para}
                </p>
              ))}
            </div>

            {/* Footer / Actions */}
            <footer className="mt-8 pt-6 text-center flex flex-col items-center gap-4" style={{ borderTop: "1px solid rgba(196,166,106,0.3)" }}>
              <button
                onClick={() => setSelectedKhutbah(null)}
                className="px-8 py-2.5 rounded-xl font-body font-bold text-sm transition-all shadow-sm hover:shadow active:scale-95"
                style={{ background: "#4a7c59", color: "#ffffff" }}
              >
                {uiTranslations.close[lang]}
              </button>
            </footer>
          </div>
        </div>
      )}

      {activePolicy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
          style={{ background: "rgba(46,50,48,0.5)", backdropFilter: "blur(6px)" }}
          onClick={() => setActivePolicy(null)}
        >
          <div
            className="parchment-card rounded-2xl relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8"
            style={{ color: "#2e3230" }}
            onClick={(e) => e.stopPropagation()}
            dir={rtl ? "rtl" : "ltr"}
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePolicy(null)}
              className="absolute top-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
              style={{ [rtl ? "left" : "right"]: "1rem", border: "1px solid rgba(196,166,106,0.3)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#74796e" }}>close</span>
            </button>

            <header className="mb-6">
              <h2 className="font-headline text-xl font-bold" style={{ color: "#4a7c59" }}>
                {activePolicy === "privacy" ? footerTranslations.privacy[lang] : footerTranslations.terms[lang]}
              </h2>
              <div className="w-12 h-0.5 mt-2" style={{ background: "rgba(196,166,106,0.5)" }} />
            </header>

            <div className="font-body text-sm leading-relaxed space-y-4" style={{ color: "#4a4e4a" }}>
              <p>
                {activePolicy === "privacy" ? policyContents.privacy[lang] : policyContents.terms[lang]}
              </p>
            </div>

            <footer className="mt-8 pt-4 flex justify-end" style={{ borderTop: "1px solid rgba(196,166,106,0.3)" }}>
              <button
                onClick={() => setActivePolicy(null)}
                className="px-6 py-2 rounded-xl font-body font-bold text-xs transition-all shadow-sm active:scale-95"
                style={{ background: "#4a7c59", color: "#ffffff" }}
              >
                {uiTranslations.dismiss[lang]}
              </button>
            </footer>
          </div>
        </div>
      )}

      {showPhoneReminderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
          style={{ background: "rgba(46,50,48,0.5)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowPhoneReminderModal(false)}
        >
          <div
            className="parchment-card rounded-2xl relative w-full max-w-lg flex flex-col animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8"
            style={{ color: "#2e3230" }}
            onClick={(e) => e.stopPropagation()}
            dir={rtl ? "rtl" : "ltr"}
          >
            {/* Close Button in corner */}
            <button
              onClick={() => setShowPhoneReminderModal(false)}
              className="absolute top-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
              style={{ [rtl ? "left" : "right"]: "1rem", border: "1px solid rgba(196,166,106,0.3)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#74796e" }}>close</span>
            </button>

            {/* Header / Icon */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(74, 124, 89, 0.1)" }}>
                <span className="material-symbols-outlined text-[32px]" style={{ color: "#4a7c59" }}>do_not_disturb_on</span>
              </div>
              <h3 className="font-headline text-2xl font-bold" style={{ color: "#4a7c59" }}>
                {uiTranslations.phoneAlertTitle[lang]}
              </h3>
              <div className="w-12 h-0.5 mt-2" style={{ background: "rgba(196,166,106,0.5)" }} />
            </div>

            {/* Content Body */}
            <div className="font-body text-sm leading-relaxed space-y-4 overflow-y-auto max-h-[40vh] pr-2 text-center" style={{ color: "#4a4e4a" }}>
              {(() => {
                const textVal = settings?.[`reminder${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof typeof settings] as string;
                return textVal?.split("\n").map((para, i) => (
                  <p key={i} className="whitespace-pre-line leading-relaxed">
                    {para}
                  </p>
                ));
              })()}
              
              <div className="pt-4 border-t" style={{ borderColor: "rgba(196,166,106,0.2)" }}>
                <p className="font-bold text-[#b83230] text-sm animate-pulse">
                  ⚠️ {uiTranslations.phoneAlertWarningFooter[lang]}
                </p>
              </div>
            </div>

            {/* Footer / Confirm button */}
            <footer className="mt-6 pt-4 text-center" style={{ borderTop: "1px solid rgba(196,166,106,0.2)" }}>
              <button
                onClick={() => setShowPhoneReminderModal(false)}
                className="w-full py-3 rounded-xl font-body font-bold text-sm transition-all shadow-sm hover:shadow active:scale-95 text-white"
                style={{ background: "#4a7c59" }}
              >
                {uiTranslations.phoneAlertButtonClose[lang]}
              </button>
            </footer>
          </div>
        </div>
      )}

      {adminPassword && (
        <AdminPanel password={adminPassword} onClose={() => setAdminPassword(null)} />
      )}
    </div>
  );
}
