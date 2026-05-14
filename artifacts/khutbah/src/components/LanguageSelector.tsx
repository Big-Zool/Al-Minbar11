import { Button } from "@/components/ui/button";
import { Language, languageNames } from "@/lib/language";

interface LanguageSelectorProps {
  onSelect: (lang: Language) => void;
}

export function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pattern-zellige opacity-30 pointer-events-none" />
      
      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-primary font-serif" dir="rtl">
            منبر الجمعة
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-serif tracking-widest uppercase">
            The Friday Pulpit
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-lg">
          {(Object.entries(languageNames) as [Language, string][]).map(([code, name]) => (
            <Button
              key={code}
              variant="outline"
              size="lg"
              className="h-24 text-2xl font-serif border-primary/20 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={() => onSelect(code)}
              dir={['ar', 'ur', 'fa'].includes(code) ? 'rtl' : 'ltr'}
            >
              {name}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
    </div>
  );
}
