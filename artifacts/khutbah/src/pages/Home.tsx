import { useState, useEffect } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Language, isRTL, formatDate, languageNames } from "@/lib/language";
import { useGetSettings, useGetCurrentKhutbah, useListKhutbahs } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPanel } from "@/components/AdminPanel";
import { Lock } from "lucide-react";
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
        body: JSON.stringify({ password })
      });
      const res = await response.json() as { valid: boolean };
      if (res.valid) {
        onLogin(password);
        setOpen(false);
        setPassword("");
        setError(false);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground/30 hover:text-muted-foreground transition-colors p-2 absolute bottom-4 right-4">
          <Lock size={14} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="ltr">
        <DialogHeader>
          <DialogTitle>Admin Login</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">Invalid password</p>}
          </div>
          <Button type="submit" className="w-full">Login</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Home() {
  const [lang, setLang] = useState<Language | null>(() => {
    const saved = localStorage.getItem("minbar_lang") as Language;
    return saved || null;
  });
  
  const [adminPassword, setAdminPassword] = useState<string | null>(null);

  useEffect(() => {
    if (lang) {
      localStorage.setItem("minbar_lang", lang);
      document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const { data: settings, isLoading: loadingSettings } = useGetSettings();
  const { data: currentKhutbah, isLoading: loadingCurrent } = useGetCurrentKhutbah();
  const { data: khutbahs, isLoading: loadingAll } = useListKhutbahs();

  if (!lang) {
    return <LanguageSelector onSelect={setLang} />;
  }

  const aboutText = settings?.[`about${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof typeof settings] as string;
  const currentTitle = currentKhutbah?.title[lang as keyof typeof currentKhutbah.title];
  const currentBody = currentKhutbah?.body[lang as keyof typeof currentKhutbah.body];

  const archive = khutbahs?.filter(k => k.id !== currentKhutbah?.id) || [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans" dir={isRTL(lang) ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="py-8 border-b border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 pattern-zellige opacity-10 pointer-events-none" />
        <div className="container mx-auto px-4 flex justify-between items-center relative z-10">
          <h1 className="text-3xl font-serif font-bold text-primary">منبر الجمعة</h1>
          <Button variant="ghost" size="sm" onClick={() => setLang(null)} className="text-muted-foreground">
            {languageNames[lang]}
          </Button>
        </div>
      </header>

      {/* Decorative Border */}
      <div className="pattern-border" />

      <main className="container mx-auto px-4 max-w-4xl py-12 space-y-24">
        
        {/* About Section */}
        {aboutText && (
          <section className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-lg md:text-xl leading-relaxed text-foreground/80 max-w-2xl mx-auto">
              {aboutText}
            </p>
          </section>
        )}

        {/* Current Khutbah */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
          <div className="text-center space-y-4">
            <h2 className="text-sm tracking-widest uppercase text-secondary font-bold">
              {lang === 'ar' ? 'خطبة اليوم' : 'Current Khutbah'}
            </h2>
            {loadingCurrent ? (
              <div className="h-12 bg-muted animate-pulse rounded w-3/4 mx-auto" />
            ) : currentKhutbah ? (
              <>
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-primary leading-tight">
                  {currentTitle}
                </h3>
                <p className="text-muted-foreground">
                  {formatDate(currentKhutbah.date, lang)}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No current khutbah found.</p>
            )}
          </div>

          {currentKhutbah && (
            <div className="bg-card border border-card-border p-8 md:p-12 rounded-xl shadow-sm relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" />
              <div className="prose prose-lg dark:prose-invert max-w-none mx-auto whitespace-pre-wrap leading-relaxed text-foreground/90 font-serif">
                {currentBody}
              </div>
            </div>
          )}
        </section>

        {/* Archive */}
        {archive.length > 0 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
            <h2 className="text-2xl font-serif font-bold text-primary text-center">
              {lang === 'ar' ? 'الأرشيف' : 'Archive'}
            </h2>
            <div className="grid gap-4">
              {archive.map((khutbah) => (
                <details key={khutbah.id} className="group bg-card border border-border rounded-lg overflow-hidden">
                  <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-muted/50 transition-colors">
                    <h4 className="text-lg font-bold text-foreground font-serif">
                      {khutbah.title[lang as keyof typeof khutbah.title]}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(khutbah.date, lang)}
                    </span>
                  </summary>
                  <div className="p-6 pt-0 border-t border-border/50 text-foreground/80 whitespace-pre-wrap font-serif">
                    {khutbah.body[lang as keyof typeof khutbah.body]}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="text-center py-12 text-sm text-muted-foreground relative">
        <p>Built by Replit</p>
        <AdminLoginModal onLogin={setAdminPassword} />
      </footer>

      {adminPassword && (
        <AdminPanel password={adminPassword} onClose={() => setAdminPassword(null)} />
      )}
    </div>
  );
}
