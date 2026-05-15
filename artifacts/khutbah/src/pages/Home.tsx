import { useState, useEffect } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AdminPanel } from "@/components/AdminPanel";
import { Language, isRTL, formatDate } from "@/lib/language";
import { useGetSettings, useGetCurrentKhutbah, useListKhutbahs } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type View = "khutbah" | "archive" | "about";

function AdminLoginModal({ onLogin }: { onLogin: (password: string) => void }) {
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
        Admin
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(46,50,48,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm mx-4 rounded-2xl p-8 shadow-2xl" style={{ background: "#faf6f0", border: "1px solid #c4c8bc" }}>
        <h2 className="font-headline text-2xl font-bold mb-1" style={{ color: "#2e3230" }}>Admin Login</h2>
        <p className="font-body text-sm mb-6" style={{ color: "#74796e" }}>Enter your password to access the admin console.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="font-body text-sm font-semibold" style={{ color: "#4a7c59" }}>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-none font-body"
              style={{ background: "#f0ece4" }}
              autoFocus
            />
            {error && <p className="font-body text-xs" style={{ color: "#b83230" }}>Invalid password. Please try again.</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setOpen(false); setError(false); setPassword(""); }}
              className="flex-1 py-2.5 rounded-xl font-body font-semibold text-sm transition-colors"
              style={{ background: "#f0ece4", color: "#4a7c59" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-body font-bold text-sm transition-colors"
              style={{ background: "#4a7c59", color: "#ffffff" }}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const langLabels: Record<Language, string> = {
  ar: "العربية", en: "English", tr: "Türkçe", fr: "Français", ur: "اردو", fa: "فارسی"
};

const viewLabels = {
  khutbah: { en: "Khutbah", ar: "الخطبة" },
  archive: { en: "Archive", ar: "الأرشيف" },
  about: { en: "About", ar: "عن الموقع" },
};

export function Home() {
  const [lang, setLang] = useState<Language | null>(() => {
    const saved = localStorage.getItem("minbar_lang") as Language;
    return saved || null;
  });
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [view, setView] = useState<View>("khutbah");
  const [searchQuery, setSearchQuery] = useState("");

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
  const currentTitle = currentKhutbah?.title[lang as keyof typeof currentKhutbah.title];
  const currentBody = currentKhutbah?.body[lang as keyof typeof currentKhutbah.body];
  const archive = khutbahs?.filter((k) => k.id !== currentKhutbah?.id) || [];
  const filteredArchive = archive.filter((k) => {
    if (!searchQuery) return true;
    const title = k.title[lang as keyof typeof k.title] || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const navLabel = (key: View) => rtl ? viewLabels[key].ar : viewLabels[key].en;

  return (
    <div className="min-h-screen font-body" style={{ background: "#faf6f0", color: "#2e3230" }} dir={rtl ? "rtl" : "ltr"}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 shadow-sm" style={{ background: "#f5f1ea", borderBottom: "1px solid #e4e0d8" }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-headline text-xl font-bold" style={{ color: "#4a7c59" }}>
            <span className="material-symbols-outlined" style={{ color: "#4a7c59", fontSize: 22, fontVariationSettings: "'FILL' 1" }}>mosque</span>
            Al-Minbar
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
                placeholder={rtl ? "بحث في الخطب..." : "Search sermons..."}
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
            <AdminLoginModal onLogin={setAdminPassword} />
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
        <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl p-7" style={{ background: "#f5f1ea", border: "1px solid rgba(196,200,188,0.4)" }}>
                <h2 className="font-headline text-2xl font-bold mb-3" style={{ color: "#4a7c59" }}>
                  {rtl ? "منبر الجمعة" : "The Friday Pulpit"}
                </h2>
                <p className="font-body text-sm leading-relaxed mb-6" style={{ color: "#4a4e4a" }}>
                  {aboutText || (rtl
                    ? "موقع خطب الجمعة للجامعة — نشر خطب الإمام الأسبوعية بست لغات"
                    : "Al-Minbar serves as a sanctuary for reflection and spiritual growth. Preserving the wisdom of the Friday Khutbah for all.")}
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#c8e8d0" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#4a7c59" }}>auto_stories</span>
                    </div>
                    <div>
                      <h4 className="font-body font-bold text-sm" style={{ color: "#2e3230" }}>
                        {rtl ? "حكمة أسبوعية" : "Weekly Wisdom"}
                      </h4>
                      <p className="font-body text-xs" style={{ color: "#74796e" }}>
                        {rtl ? "خطب مختارة بعناية كل جمعة" : "Carefully curated sermons every Jumu'ah."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#f8e0a8" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#705c30" }}>translate</span>
                    </div>
                    <div>
                      <h4 className="font-body font-bold text-sm" style={{ color: "#2e3230" }}>
                        {rtl ? "انتشار عالمي" : "Global Reach"}
                      </h4>
                      <p className="font-body text-xs" style={{ color: "#74796e" }}>
                        {rtl ? "ترجمات بست لغات للجميع" : "Translations in 6 languages for inclusivity."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </aside>

            {/* Right: parchment article */}
            <article className="lg:col-span-8">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <span className="font-body text-xs font-bold uppercase tracking-widest" style={{ color: "#705c30" }}>
                    {rtl ? "خطبة اليوم" : "Current Feature"}
                  </span>
                  <h1 className="font-headline text-4xl md:text-5xl font-bold mt-1" style={{ color: "#2e3230" }}>
                    {rtl ? "خطبة اليوم" : "Today's Khutbah"}
                  </h1>
                </div>
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
                <div className="parchment-card rounded-2xl relative overflow-hidden" style={{ padding: "3rem" }}>
                  <div className="absolute top-4 left-4 opacity-15 pointer-events-none">
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#c4a66a" }}>filter_vintage</span>
                  </div>
                  <div className="absolute top-4 right-4 opacity-15 pointer-events-none">
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#c4a66a" }}>filter_vintage</span>
                  </div>

                  <header className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 font-body text-xs font-bold" style={{ background: "#f8e0a8", color: "#554020" }}>
                      {formatDate(currentKhutbah.date, lang)}
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
                      <div className="flex gap-2">
                        <button className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ border: "1px solid #c4c8bc" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#74796e" }}>share</span>
                        </button>
                        <button className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ border: "1px solid #c4c8bc" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#74796e" }}>bookmark</span>
                        </button>
                      </div>
                    </div>
                  </footer>
                </div>
              ) : (
                <div className="parchment-card rounded-2xl p-16 text-center">
                  <span className="material-symbols-outlined mb-4 block" style={{ fontSize: 48, color: "#c4c8bc" }}>menu_book</span>
                  <p className="font-body" style={{ color: "#74796e" }}>
                    {rtl ? "لا توجد خطبة حالية" : "No current khutbah available."}
                  </p>
                </div>
              )}
            </article>
          </div>
        </main>
      )}

      {/* ── Archive ── */}
      {view === "archive" && (
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 min-h-screen">
          <aside className="w-full md:w-56 flex-shrink-0">
            <div className="rounded-2xl p-5 sticky top-24" style={{ background: "#f0ece4" }}>
              <div className="mb-5 px-2">
                <h2 className="font-headline text-base font-bold" style={{ color: "#4a7c59" }}>Al-Minbar</h2>
                <p className="font-body text-xs" style={{ color: "#74796e" }}>
                  {rtl ? "خطب الجمعة الأسبوعية" : "Weekly Friday Sermons"}
                </p>
              </div>
              <nav className="space-y-1">
                {[
                  { icon: "menu_book", label: rtl ? "خطبة اليوم" : "Today's Khutbah", action: () => setView("khutbah") },
                  { icon: "history", label: rtl ? "الأرشيف" : "Archive", active: true },
                  { icon: "info", label: rtl ? "عن الموقع" : "About Us", action: () => setView("about") },
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
                {rtl ? "أرشيف الخطب" : "Khutbah Archive"}
              </h1>
              <p className="font-body text-sm mt-2" style={{ color: "#74796e" }}>
                {rtl
                  ? "تصفح مجموعة خطب الجمعة السابقة"
                  : "Browse our collection of past Friday sermons."}
              </p>
            </div>

            <div className="relative mb-8">
              <span className="material-symbols-outlined absolute top-1/2 -translate-y-1/2" style={{ fontSize: 18, color: "#74796e", left: rtl ? "auto" : 14, right: rtl ? 14 : "auto" }}>search</span>
              <input
                className="w-full font-body text-sm rounded-2xl border py-3 outline-none"
                style={{ paddingLeft: rtl ? 14 : 44, paddingRight: rtl ? 44 : 14, background: "#ffffff", borderColor: "#c4c8bc", color: "#2e3230" }}
                placeholder={rtl ? "البحث حسب الموضوع أو العنوان..." : "Search by topic or title..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredArchive.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined mb-3 block" style={{ fontSize: 48, color: "#c4c8bc" }}>search_off</span>
                <p className="font-body" style={{ color: "#74796e" }}>
                  {rtl ? "لا توجد نتائج" : "No sermons found."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredArchive.map((k) => {
                  const title = k.title[lang as keyof typeof k.title];
                  const body = k.body[lang as keyof typeof k.body];
                  const excerpt = body?.slice(0, 100) + "...";
                  const month = new Date(k.date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { month: "long", year: "numeric" }).toUpperCase();
                  return (
                    <div key={k.id} className="archive-card rounded-2xl p-6 flex flex-col justify-between min-h-52 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
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
                          {new Date(k.date).toLocaleDateString()}
                        </span>
                        <span className="font-body text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff" }}>
                          {rtl ? "اقرأ" : "Read"}
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
        <main className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <span className="material-symbols-outlined mb-4 block" style={{ fontSize: 48, color: "#4a7c59", fontVariationSettings: "'FILL' 1" }}>mosque</span>
            <h1 className="font-headline text-4xl font-bold" style={{ color: "#2e3230" }}>
              {rtl ? "عن منبر الجمعة" : "About Al-Minbar"}
            </h1>
          </div>
          <div className="parchment-card rounded-2xl p-10">
            <p className="font-body text-base leading-relaxed" style={{ color: "#4a4e4a" }}>
              {aboutText || (rtl
                ? "موقع خطب الجمعة للجامعة — نشر خطب الإمام الأسبوعية بست لغات لجميع أبناء المجتمع."
                : "Al-Minbar is the University Friday Prayer website, publishing the Imam's weekly sermons in six languages to serve the entire community.")}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: "translate", label: rtl ? "٦ لغات" : "6 Languages", sub: rtl ? "عربي، إنجليزي، تركي، فرنسي، أردو، فارسي" : "Arabic, English, Turkish, French, Urdu, Farsi" },
                { icon: "calendar_month", label: rtl ? "أسبوعياً" : "Weekly Updates", sub: rtl ? "خطبة جديدة كل جمعة" : "A new khutbah every Friday" },
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
                {rtl ? "تواصل معي" : "Contact with me"}
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
                <a href="https://github.com/Big-Zool/portfolio.git" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-body text-sm hover:text-[#4a7c59] transition-colors" style={{ color: "#4a4e4a" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#74796e" }}>web</span>
                  {rtl ? "الموقع الشخصي" : "Portfolio"}
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
            <div className="font-headline text-lg font-bold" style={{ color: "#705c30" }}>Al-Minbar</div>
            <p className="font-body text-xs" style={{ color: "#74796e" }}>
              {rtl ? "رفع الرسالة، تثبيت القلب" : "Elevating the message, anchoring the heart."}
            </p>
          </div>
          <div className="flex gap-6 font-body text-xs" style={{ color: "#74796e" }}>
            <span className="hover:text-[#4a7c59] transition-colors cursor-default">
              {rtl ? "سياسة الخصوصية" : "Privacy Policy"}
            </span>
            <span className="hover:text-[#4a7c59] transition-colors cursor-default">
              {rtl ? "شروط الاستخدام" : "Terms of Use"}
            </span>
            <button
              onClick={() => setView("about")}
              className="hover:text-[#4a7c59] transition-colors"
            >
              {rtl ? "تواصل معنا" : "Contact Us"}
            </button>
          </div>
          <p className="font-body text-xs" style={{ color: "#74796e" }}>
            © 2026 Al-Minbar Sermons.
          </p>
        </div>
      </footer>

      {adminPassword && (
        <AdminPanel password={adminPassword} onClose={() => setAdminPassword(null)} />
      )}
    </div>
  );
}
