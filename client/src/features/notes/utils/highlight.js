import { C, alpha } from "../../../shared/constants/theme";

// ألوان التظليل من رموز السمة وحدها، فتتبدّل مع الوضع الفاتح والداكن
export const TINTS = { gold: C.gold, green: C.green, rose: C.red };
export const COLOR_KEYS = Object.keys(TINTS);
export const tintOf = (key) => TINTS[key] || C.gold;
export const tintBg = (key) => alpha(tintOf(key), 0.28);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// نطابق النص المقتبس مع تسامح في المسافات: النسخ من المتصفح قد يجمع أسطراً أو يضيف فراغاً
const findQuote = (src, quote) => {
  const words = quote.trim().split(/\s+/).filter(Boolean).map(escapeRe);
  if (!words.length) return null;
  const match = new RegExp(words.join("\\s+")).exec(src);
  return match ? { start: match.index, end: match.index + match[0].length } : null;
};

// يقسّم نص البطاقة إلى مقاطع: عادية ومظلَّلة.
// تظليل لم يعد نصه موجوداً (لأن المشرف حرّر البطاقة) يُتجاهل بصمت بدل أن يكسر الصفحة.
export function splitHighlights(text, notes = []) {
  const src = String(text ?? "");
  if (!src) return [];
  const ranges = [];
  for (const note of notes) {
    const found = findQuote(src, String(note?.text || ""));
    if (!found) continue;
    // التداخل يُنتج وسوماً متشابكة: نُبقي أول تظليل ونتجاهل ما يتقاطع معه
    if (ranges.some((r) => found.start < r.end && found.end > r.start)) continue;
    ranges.push({ ...found, note });
  }
  ranges.sort((a, b) => a.start - b.start);

  const parts = [];
  let at = 0;
  for (const r of ranges) {
    if (r.start > at) parts.push({ key: `t${at}`, text: src.slice(at, r.start) });
    parts.push({ key: `h${r.start}`, text: src.slice(r.start, r.end), note: r.note });
    at = r.end;
  }
  if (at < src.length) parts.push({ key: `t${at}`, text: src.slice(at) });
  return parts;
}
