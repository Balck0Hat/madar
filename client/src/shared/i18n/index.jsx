import { createContext, useContext } from "react";
import { ar } from "./ar";

// بنية الترجمة: العربية هي المصدر، وأي لغة أخرى تُضاف كملف بنفس المفاتيح.
// اللغة تحدد أيضاً اتجاه الصفحة، فالإنجليزية مثلاً ltr.
export const LOCALES = {
  ar: { name: "العربية", dir: "rtl", dict: ar },
};

export const DEFAULT_LOCALE = "ar";

export const I18nCtx = createContext({ locale: DEFAULT_LOCALE, dir: "rtl", t: (k) => k });

// t("map.start") → النص، و t("result.gain", { n: 110 }) يستبدل {n}
export function translator(locale = DEFAULT_LOCALE) {
  const dict = LOCALES[locale]?.dict || ar;
  return (key, vars) => {
    const raw = key.split(".").reduce((o, part) => (o == null ? undefined : o[part]), dict);
    // المفتاح المفقود يعود كما هو ليظهر في الواجهة بدل أن يختفي النص بصمت
    if (typeof raw !== "string") return key;
    return vars ? raw.replace(/\{(\w+)\}/g, (m, v) => (vars[v] ?? m)) : raw;
  };
}

export const useI18n = () => useContext(I18nCtx);
export const useT = () => useContext(I18nCtx).t;

export function I18nProvider({ locale = DEFAULT_LOCALE, children }) {
  const meta = LOCALES[locale] || LOCALES[DEFAULT_LOCALE];
  const value = { locale, dir: meta.dir, t: translator(locale) };
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}
