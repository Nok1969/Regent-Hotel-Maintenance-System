import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="flex bg-muted rounded-lg p-1">
      <Button
        variant={currentLanguage === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => changeLanguage("en")}
        className="h-8 px-3 text-xs font-medium"
      >
        EN
      </Button>
      <Button
        variant={currentLanguage === "th" ? "default" : "ghost"}
        size="sm"
        onClick={() => changeLanguage("th")}
        className="h-8 px-3 text-xs font-medium"
      >
        TH
      </Button>
    </div>
  );
}
