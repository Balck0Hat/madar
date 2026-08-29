import { get } from "../../../shared/utils/api";

// شكل النتيجة الواحدة: { unitId, title, snippet }
// الخادم يلفّ الكلمة المطابقة داخل «...» لنبرزها في الواجهة
const isText = (v) => typeof v === "string" && v.trim().length > 0;

const toResult = (r) =>
  r && isText(r.unitId)
    ? { unitId: r.unitId, title: isText(r.title) ? r.title : "", snippet: isText(r.snippet) ? r.snippet : "" }
    : null;

const list = (v) => (Array.isArray(v) ? v : []);

// تطبيع دفاعي: قد تغيب الحقول أو تعود المصفوفات فارغة أو غير موجودة أصلاً.
// نضمّ summaries إلى النتائج لأنها بنفس الشكل، مع استبعاد ما تكرّر بنفس المقتطف.
export function normalizeSearch(data) {
  const seen = new Set();
  const results = [...list(data?.results), ...list(data?.summaries)]
    .map(toResult)
    .filter(Boolean)
    .filter((r) => {
      const key = `${r.unitId}|${r.snippet}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return { results };
}

// بحث نصي في الوحدات والخلاصات
export const searchUnits = (q) => get(`/search?q=${encodeURIComponent(q)}`).then(normalizeSearch);
