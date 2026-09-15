// ذكر الأسماء في النصوص: مفتاح كل شخصية أول كلمة من اسمها (أو كلمتان إن قصُرت
// الأولى، كـ«لاو تسي»)، ويُطابَق على حدود الكلمات مع سوابق الحروف (وكورش،
// بطاليس)، ولا يُحتسب ما جاء كنيةً («أبو موسى» ليس موسى).
// النسخة نفسها في الخادم (shared/utils/mentions.js) تحسب روابط الدروس عند الزرع.

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const KUNYA = /(?:أبو|أبي|أبا|أم)\s+$/;

export const nameKey = (name) => {
  const w = String(name || "").trim().split(/\s+/);
  return w[0]?.length >= 4 ? w[0] : w.slice(0, 2).join(" ");
};

export function mentionCount(text, name) {
  const key = nameKey(name);
  if (!key) return 0;
  const re = new RegExp(`(?<![\\p{L}])(?:و|ف|ب|ل|ك|وب|ول)?${escapeRe(key)}(?![\\p{L}])`, "gu");
  const src = String(text || "");
  let n = 0;
  for (const m of src.matchAll(re)) if (!KUNYA.test(src.slice(Math.max(0, m.index - 6), m.index))) n++;
  return n;
}

// من القائمة ذُكر في هذا النصّ، الأكثر ذكراً أولاً
export const mentionedIn = (text, list, exceptId = null) =>
  list
    .filter((f) => f.figureId !== exceptId)
    .map((figure) => ({ figure, count: mentionCount(text, figure.name) }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
