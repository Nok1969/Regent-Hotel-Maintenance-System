import { useTranslation } from "react-i18next";

export function useLanguage() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    isEnglish: i18n.language === "en",
    isThai: i18n.language === "th",
    t, // Include translation function
  };
}
