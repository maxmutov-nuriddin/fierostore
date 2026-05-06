import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";

export function useT() {
  const { lang } = useLanguage();
  return t[lang];
}
