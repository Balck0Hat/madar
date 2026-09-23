import { SURAS, SIMILAR, suraAyahs, pageAyahs, ayah as findAyah } from "../../shared/data/quran/index.js";
import { notFound } from "../../shared/utils/AppError.js";
import * as memo from "./quran.memo.js";

export const suras = () => SURAS;

export function sura(n) {
  const s = memo.suraOf(n);
  if (!s) throw notFound("السورة غير موجودة", "SURA_NOT_FOUND");
  return { ...s, ayahs: suraAyahs(n) };
}

export function page(p) {
  const ayahs = pageAyahs(p);
  if (!ayahs.length) throw notFound("الصفحة غير موجودة", "PAGE_NOT_FOUND");
  return { page: Number(p), ayahs };
}

export function ayah(s, a) {
  const x = findAyah(s, a);
  if (!x) throw notFound("الآية غير موجودة", "AYAH_NOT_FOUND");
  return x;
}

// المتشابهات: آيات تشترك مع هذه الآية في خمس كلمات متتالية فأكثر، حُسبت آلياً
export const similar = (s, a) => (SIMILAR[`${s}:${a}`] || []).map((k) => { const [ss, aa] = k.split(":").map(Number); return findAyah(ss, aa); }).filter(Boolean);

export async function overview(userId) {
  const m = await memo.get(userId);
  return { goal: m.goal, today: memo.today(m), juz: memo.juzMap(m.items), items: m.items, sessions: m.sessions.slice(-10) };
}

export const setGoal = memo.setGoal;
export const review = memo.review;
export const logSession = memo.logSession;
