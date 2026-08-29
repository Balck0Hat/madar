import { createContext, useContext, useEffect } from "react";
import { toAr } from "../utils/text";

// تفضيلات العرض: السمة، حجم النص، شكل الأرقام. تُحفظ على الحساب وتُطبّق على جذر الصفحة.
export const PrefsCtx = createContext({ theme: "system", fontScale: 1, arabicNums: false, setPrefs: () => {} });

export const useNum = () => {
  const { arabicNums } = useContext(PrefsCtx);
  return (v) => (arabicNums ? toAr(v) : String(v));
};

export const usePrefs = () => useContext(PrefsCtx);

const systemDark = () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;

export function PrefsProvider({ value, children }) {
  const { theme = "system", fontScale = 1 } = value;
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => root.setAttribute("data-theme", theme === "system" ? (systemDark() ? "dark" : "light") : theme);
    apply();
    root.style.setProperty("--font-scale", String(fontScale));
    if (theme !== "system") return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, fontScale]);
  return <PrefsCtx.Provider value={value}>{children}</PrefsCtx.Provider>;
}
