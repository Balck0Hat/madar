import { DOMAINS } from "../data/domains";
import { CENTER, THREADS, RING1_TOTAL } from "../data/curriculum";
import { uid } from "./units";

// إحصاءات مشتقة من خريطة التقدم { unitId: { score, total, perfect, sim } }
export function stats(progress) {
  const ids = Object.keys(progress);
  const units = ids.length;
  const perfects = ids.filter((k) => progress[k].perfect).length;
  const centerDone = CENTER.every((_, i) => progress[`center-${i + 1}`]);
  const domainsTouched = new Set(ids.filter((k) => !k.startsWith("center")).map((k) => k.split("-")[0])).size;
  const sectors = DOMAINS.filter((d) => d.rings[0].every((_, i) => progress[uid(d.id, 0, i)])).length;
  const ring1Done = sectors === DOMAINS.length && centerDone;
  const threads = THREADS.filter(([a, b]) => progress[a] && progress[b]).length;
  const rank = ring1Done ? "مثقف" : centerDone && sectors >= 1 ? "مستكشف" : "زائر";
  const ring1Count = ids.filter((k) => k.startsWith("center") || k.split("-")[1] === "1").length;
  return { units, perfects, centerDone, domainsTouched, sectors, ring1Done, threads, rank, ring1Count };
}

// فتح رأسي: إتمام مدار في مجال يفتح الذي يليه في المجال نفسه.
// المدار الأول مفتوح دائماً، فمن يحب الفيزياء يصلها بعد ثماني وحدات لا ثلاث وثمانين.
export function ringUnlocked(progress, domainId, ring) {
  if (ring === 0) return true;
  const dom = DOMAINS.find((d) => d.id === domainId);
  if (!dom) return false;
  return dom.rings[ring - 1].every((_, i) => progress[uid(domainId, ring - 1, i)]);
}

// وحدة مقفلة تُقرأ منها الشرارة وأول بطاقة فقط: نبيع العمق بدل أن نخفيه
export const unitUnlocked = (progress, unitId) => {
  if (unitId.startsWith("center")) return true;
  const [d, r] = unitId.split("-");
  return ringUnlocked(progress, d, Number(r) - 1);
};

// الوحدة الموصى بها: المركز أولاً، ثم المجال المفضل، ثم البقية بالترتيب
export function nextUnit(progress, fav) {
  for (let i = 0; i < CENTER.length; i++) if (!progress[`center-${i + 1}`]) return `center-${i + 1}`;
  const order = [fav, ...DOMAINS.map((d) => d.id).filter((x) => x !== fav)];
  for (const d of order) for (let i = 0; i < 8; i++) if (!progress[uid(d, 0, i)]) return uid(d, 0, i);
  return null;
}

// تقدير موعد إكمال المدار الأول بوتيرة دقائق يومية معيّنة (40 دقيقة للوحدة)
export function eta(progress, minutes) {
  const st = stats(progress);
  const remaining = Math.max(0, RING1_TOTAL - st.ring1Count);
  const days = Math.ceil((remaining * 40) / minutes);
  const d = new Date(Date.now() + days * 864e5);
  return { days, label: d.toLocaleDateString("ar", { day: "numeric", month: "long" }) };
}

export const domainDone = (progress, domainId, ring) =>
  Array.from({ length: 8 }).filter((_, i) => progress[uid(domainId, ring, i)]).length;
