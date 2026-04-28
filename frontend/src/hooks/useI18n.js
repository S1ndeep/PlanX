import { useMemo, useState } from "react";
import { translations } from "../i18n/translations.js";

const detectLanguage = () => {
  const saved = localStorage.getItem("tripwise-language");
  if (saved && translations[saved]) return saved;

  const browserLanguage = navigator.language?.toLowerCase() || "en";
  return browserLanguage.startsWith("hi") ? "hi" : "en";
};

export const useI18n = () => {
  const [language, setLanguageState] = useState(detectLanguage);

  const setLanguage = (nextLanguage) => {
    const normalized = translations[nextLanguage] ? nextLanguage : "en";
    localStorage.setItem("tripwise-language", normalized);
    setLanguageState(normalized);
  };

  const t = useMemo(() => {
    const dictionary = translations[language] || translations.en;
    return (key) => dictionary[key] || translations.en[key] || key;
  }, [language]);

  return {
    language,
    setLanguage,
    t,
    languages: Object.keys(translations)
  };
};
