import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import pt from "../locales/pt.json";
import en from "../locales/en.json";

function detectLanguage(): "pt" | "en" {
  const device = Localization.getLocales?.()[0]?.languageCode || "en";
  return device === "pt" ? "pt" : "en";
}

i18n.use(initReactI18next).init({
  lng: detectLanguage(),
  fallbackLng: "en",
  resources: {
    pt: { translation: pt },
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
