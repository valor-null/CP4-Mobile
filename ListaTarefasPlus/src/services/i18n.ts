import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import pt from "../locales/pt.json";
import en from "../locales/en.json";

const STORAGE_KEY = "@lang";

async function detectLanguage(): Promise<"pt" | "en"> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === "pt" || saved === "en") return saved;
  } catch {}
  const device = Localization.getLocales?.()[0]?.languageCode || "en";
  return device === "pt" ? "pt" : "en";
}

i18n.use(initReactI18next).init({
  lng: "pt",
  fallbackLng: "en",
  resources: {
    pt: { translation: pt },
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
});

detectLanguage().then((lng) => {
  i18n.changeLanguage(lng);
});

const _change = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = async (lng: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lng);
  } catch {}
  return _change(lng);
};

export default i18n;
