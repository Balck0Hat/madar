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

// شريط المتصفّح والحالة على الهاتف يقرآن theme-color. وسمَا الـHTML يغطّيان
// «تلقائي» وحده؛ الاختيار الصريح للسمة لا يمرّ بـ prefers-color-scheme فنكتبه هنا.
const BAR = { dark: "#0B1020", light: "#F7F4EC" };
function paintBrowserBar(mode) {
  const head = document.head;
  let tag = head.querySelector('meta[name="theme-color"]:not([media])');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "theme-color");
    head.appendChild(tag);
  }
  tag.setAttribute("content", BAR[mode]);
}

export function PrefsProvider({ value, children }) {
  const { theme = "system", fontScale = 1 } = value;
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const mode = theme === "system" ? (systemDark() ? "dark" : "light") : theme;
      root.setAttribute("data-theme", mode);
      paintBrowserBar(mode);
    };
    apply();
    root.style.setProperty("--font-scale", String(fontScale));
    if (theme !== "system") return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, fontScale]);
  return <PrefsCtx.Provider value={value}>{children}</PrefsCtx.Provider>;
}
