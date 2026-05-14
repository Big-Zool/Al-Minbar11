import type { Language } from "@/lib/language";

const LANGUAGES: { code: Language; name: string; label: string; dir?: "rtl" }[] = [
  { code: "ar", name: "العربية", label: "ARABIC", dir: "rtl" },
  { code: "en", name: "English", label: "GLOBAL" },
  { code: "tr", name: "Türkçe", label: "TURKISH" },
  { code: "fr", name: "Français", label: "FRENCH" },
  { code: "ur", name: "اردو", label: "URDU", dir: "rtl" },
  { code: "fa", name: "فارسی", label: "FARSI", dir: "rtl" },
];

export function LanguageSelector({ onSelect }: { onSelect: (lang: Language) => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg,#c97b6e 0%,#b86860 10%,#c47a6f 22%,#b96560 35%,#c47870 48%,#b86060 60%,#c07268 72%,#b96a62 84%,#c4796d 100%)",
      }}
    >
      <div className="absolute top-0 left-0 w-24 h-24 opacity-25 pointer-events-none select-none">
        <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L96 0 L96 8 Q48 8 8 48 L0 48 Z" fill="#7a3020" opacity="0.7" />
          <path d="M0 0 L8 0 L8 96 L0 96 Z" fill="#7a3020" opacity="0.5" />
          <circle cx="8" cy="8" r="4" fill="#7a3020" opacity="0.6" />
          <path d="M14 14 Q42 14 14 42" stroke="#7a3020" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M20 20 Q38 20 20 38" stroke="#7a3020" strokeWidth="1" fill="none" opacity="0.4" />
        </svg>
      </div>

      <div className="flex flex-col items-center gap-6 z-10 px-4 w-full max-w-lg">
        <div
          className="w-36 h-36 rounded-2xl flex items-center justify-center shadow-2xl"
          style={{
            background: "linear-gradient(145deg,#f8e8b0 0%,#e8c870 40%,#d4a840 100%)",
            border: "3px solid rgba(255,255,255,0.35)",
          }}
        >
          <span
            className="font-headline text-6xl font-bold"
            style={{ color: "#1b3d28", fontStyle: "italic", lineHeight: 1 }}
          >
            خ
          </span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="font-headline text-4xl font-bold" style={{ color: "#4a7c59" }}>
            Al-Minbar
          </h1>
          <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.03em" }}>
            Choose your language to continue
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-2 w-full">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              dir={lang.dir}
              className="group flex flex-col items-center justify-center gap-1.5 py-5 px-3 rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-xl"
              style={{
                background: "rgba(250,246,240,0.92)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              <span
                className="font-headline text-xl font-bold transition-colors group-hover:text-[#4a7c59]"
                style={{ color: "#2e3230" }}
              >
                {lang.name}
              </span>
              <span className="font-body text-xs font-semibold tracking-widest" style={{ color: "#74796e" }}>
                {lang.label}
              </span>
              <div
                className="w-6 h-0.5 rounded-full mt-0.5 opacity-25 group-hover:opacity-60 transition-opacity"
                style={{ background: "#4a7c59" }}
              />
            </button>
          ))}
        </div>
      </div>

      <footer className="absolute bottom-6 flex items-center gap-3 z-10">
        <div className="h-px w-8" style={{ background: "rgba(255,255,255,0.4)" }} />
        <span
          className="material-symbols-outlined"
          style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, fontVariationSettings: "'FILL' 1" }}
        >
          menu_book
        </span>
        <div className="h-px w-8" style={{ background: "rgba(255,255,255,0.4)" }} />
        <span className="font-body text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
          © 2024 Al-Minbar Sermons. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
