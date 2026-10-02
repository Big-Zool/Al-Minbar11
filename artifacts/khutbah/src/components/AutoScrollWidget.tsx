import { Slider } from "@/components/ui/slider";
import { useAutoScroll, MIN_SPEED, MAX_SPEED } from "@/hooks/use-auto-scroll";
import { Language, isRTL } from "@/lib/language";

const t: Record<string, Record<Language, string>> = {
  autoScroll: {
    ar: "تمرير تلقائي؟",
    en: "Auto-scroll?",
    tr: "Otomatik kaydırma?",
    fr: "Défilement auto ?",
    ur: "خودکار اسکرول؟",
    fa: "پیمایش خودکار؟",
  },
  scrollSpeed: {
    ar: "سرعة التمرير",
    en: "Scroll speed",
    tr: "Kaydırma hızı",
    fr: "Vitesse de défilement",
    ur: "اسکرول کی رفتار",
    fa: "سرعت پیمایش",
  },
  timeLeft: {
    ar: "متبقي {time}",
    en: "{time} left",
    tr: "{time} kaldı",
    fr: "{time} restantes",
    ur: "{time} باقی",
    fa: "{time} باقی‌مانده",
  },
  pause: {
    ar: "إيقاف مؤقت",
    en: "Pause",
    tr: "Duraklat",
    fr: "Pause",
    ur: "روکیں",
    fa: "توقف",
  },
  resume: {
    ar: "استئناف",
    en: "Resume",
    tr: "Devam et",
    fr: "Reprendre",
    ur: "جاری رکھیں",
    fa: "ادامه",
  },
  stop: {
    ar: "إيقاف",
    en: "Stop",
    tr: "Durdur",
    fr: "Arrêter",
    ur: "بند کریں",
    fa: "پایان",
  },
  backToTop: {
    ar: "العودة للأعلى",
    en: "Back to top",
    tr: "Başa dön",
    fr: "Retour en haut",
    ur: "اوپر جائیں",
    fa: "بازگشت به بالا",
  },
  minimize: {
    ar: "تصغير",
    en: "Minimize",
    tr: "Küçült",
    fr: "Réduire",
    ur: "چھوٹا کریں",
    fa: "کوچک کردن",
  },
  adjustSpeed: {
    ar: "ضبط سرعة التمرير",
    en: "Adjust scroll speed",
    tr: "Kaydırma hızını ayarla",
    fr: "Régler la vitesse de défilement",
    ur: "اسکرول کی رفتار بدلیں",
    fa: "تنظیم سرعت پیمایش",
  },
  slower: {
    ar: "أبطأ",
    en: "Slower",
    tr: "Daha yavaş",
    fr: "Plus lent",
    ur: "آہستہ",
    fa: "آهسته‌تر",
  },
  faster: {
    ar: "أسرع",
    en: "Faster",
    tr: "Daha hızlı",
    fr: "Plus rapide",
    ur: "تیز",
    fa: "سریع‌تر",
  },
};

const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const pillClass =
  "flex items-center gap-2.5 px-6 h-[52px] rounded-full font-body font-semibold text-sm text-white transition-all active:scale-95 hover:brightness-95 group";
const pillStyle = { background: "#4a7c59", boxShadow: "0 6px 18px rgba(46,50,48,0.22)" };

const formatSpeed = (speed: number) => `${speed.toFixed(1)}×`;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export function AutoScrollWidget({ lang }: { lang: Language }) {
  const scroll = useAutoScroll();
  const rtl = isRTL(lang);

  return (
    <div className="fixed bottom-6 z-40" style={{ [rtl ? "left" : "right"]: "1.5rem" }}>
      {scroll.mode === "idle" && (
        <button onClick={scroll.start} className={pillClass} style={pillStyle}>
          <span className="material-symbols-outlined transition-transform group-hover:translate-y-0.5" style={{ fontSize: 20 }}>
            keyboard_double_arrow_down
          </span>
          {t.autoScroll[lang]}
        </button>
      )}

      {scroll.mode === "active" && (
        <button
          onClick={scroll.openDrawer}
          aria-label={t.adjustSpeed[lang]}
          title={t.adjustSpeed[lang]}
          className="relative w-[60px] h-[60px] rounded-full flex items-center justify-center text-white transition-all hover:brightness-95"
          style={{ background: "#4a7c59", boxShadow: "0 6px 18px rgba(46,50,48,0.25)" }}
        >
          <svg className="absolute w-[56px] h-[56px]" viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="30" cy="30" r={RING_RADIUS} fill="transparent" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
            <circle
              cx="30"
              cy="30"
              r={RING_RADIUS}
              fill="transparent"
              stroke="#f8e0a8"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - scroll.progress)}
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.15s ease-out" }}
            />
          </svg>
          <span className="relative flex flex-col items-center leading-none">
            <span className="font-body text-xs font-bold tracking-tighter" dir="ltr">{formatSpeed(scroll.speed)}</span>
            <span className="material-symbols-outlined animate-bounce" style={{ fontSize: 14, marginTop: 2 }}>expand_more</span>
          </span>
        </button>
      )}

      {scroll.mode === "drawer" && (
        <div
          className="w-[calc(100vw-3rem)] max-w-[410px] rounded-2xl overflow-hidden"
          style={{ background: "#fffdf8", border: "1px solid #e4e0d8", boxShadow: "0 10px 30px rgba(46,50,48,0.22)" }}
        >
          <div className="w-full h-[3px]" style={{ background: "#eee9df" }}>
            <div className="h-full transition-all duration-150" style={{ width: `${scroll.progress * 100}%`, background: "#c4a66a" }} />
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-body text-sm font-bold" style={{ color: "#2e3230" }}>{t.scrollSpeed[lang]}</h3>
                <p className="font-body text-xs" style={{ color: "#74796e" }}>
                  {t.timeLeft[lang].replace("{time}", formatTime(scroll.secondsLeft))}
                </p>
              </div>
              <button
                onClick={scroll.collapse}
                aria-label={t.minimize[lang]}
                title={t.minimize[lang]}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f5f1ea]"
                style={{ color: "#74796e" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>expand_more</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between font-body text-xs" style={{ color: "#74796e" }}>
                <span dir="ltr">{formatSpeed(MIN_SPEED)}</span>
                <span
                  className="px-2 py-0.5 rounded font-bold"
                  style={{ background: "#f5f1ea", border: "1px solid #e4e0d8", color: "#2a6038" }}
                  dir="ltr"
                >
                  {formatSpeed(scroll.speed)}
                </span>
                <span dir="ltr">{formatSpeed(MAX_SPEED)}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => scroll.setSpeed(scroll.speed - 0.1)}
                  disabled={scroll.speed <= MIN_SPEED}
                  aria-label={t.slower[lang]}
                  className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold transition-colors hover:bg-[#f5f1ea] disabled:opacity-40 select-none"
                  style={{ border: "1px solid #e4e0d8", color: "#2e3230" }}
                >
                  −
                </button>
                <Slider
                  dir={rtl ? "rtl" : "ltr"}
                  min={MIN_SPEED}
                  max={MAX_SPEED}
                  step={0.1}
                  value={[scroll.speed]}
                  onValueChange={([value]) => scroll.setSpeed(value)}
                  aria-label={t.scrollSpeed[lang]}
                />
                <button
                  onClick={() => scroll.setSpeed(scroll.speed + 0.1)}
                  disabled={scroll.speed >= MAX_SPEED}
                  aria-label={t.faster[lang]}
                  className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold transition-colors hover:bg-[#f5f1ea] disabled:opacity-40 select-none"
                  style={{ border: "1px solid #e4e0d8", color: "#2e3230" }}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={scroll.isScrolling && !scroll.isPaused ? scroll.pause : scroll.resume}
                className="flex-1 py-2.5 rounded-xl font-body font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all hover:brightness-95 active:scale-95"
                style={{ background: "#4a7c59" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
                  {scroll.isScrolling && !scroll.isPaused ? "pause" : "play_arrow"}
                </span>
                {scroll.isScrolling && !scroll.isPaused ? t.pause[lang] : t.resume[lang]}
              </button>
              <button
                onClick={scroll.stop}
                className="px-5 py-2.5 rounded-xl font-body font-semibold text-sm transition-colors hover:bg-[#f5f1ea]"
                style={{ border: "1px solid #e4e0d8", color: "#2e3230" }}
              >
                {t.stop[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {scroll.mode === "finished" && (
        <button onClick={scroll.backToTop} className={pillClass} style={pillStyle}>
          <span className="material-symbols-outlined transition-transform group-hover:-translate-y-0.5" style={{ fontSize: 20 }}>
            keyboard_double_arrow_up
          </span>
          {t.backToTop[lang]}
        </button>
      )}
    </div>
  );
}
