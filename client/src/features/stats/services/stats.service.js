import { get } from "../../../shared/utils/api";

const num = (v, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const list = (v) => (Array.isArray(v) ? v : []);
// strongest/weakest قد يعود كنص (معرّف المجال) أو ككائن؛ نقبل الشكلين
const domainId = (v) => (typeof v === "string" ? v : typeof v?.domain === "string" ? v.domain : typeof v?.id === "string" ? v.id : null);

// تطبيع دفاعي: أي حقل ناقص من الخادم لا يجب أن يُسقط الشاشة
export function normalizeStats(data) {
  return {
    weeks: list(data?.weeks)
      .filter((w) => w && (typeof w.week === "string" || typeof w.week === "number"))
      .map((w) => ({ week: String(w.week), xp: num(w.xp) })),
    byDomain: list(data?.byDomain)
      .filter((d) => typeof d?.domain === "string")
      .map((d) => ({ domain: d.domain, done: num(d.done), total: num(d.total, 8) || 8, xp: num(d.xp) })),
    strongest: domainId(data?.strongest),
    weakest: domainId(data?.weakest),
    totalMinutes: num(data?.totalMinutes),
    quizAccuracy: num(data?.quizAccuracy, null),
  };
}

// إحصاءات التقدّم: نقاط أسبوعية، إنجاز كل مجال، دقائق الدراسة، دقة الاختبارات
export const getStats = () => get("/progress/stats").then(normalizeStats);
