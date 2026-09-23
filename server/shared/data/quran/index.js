import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalize } from "../../utils/arabic.js";

// نصّ المصحف: الرسم العثماني برواية حفص من مجموعة quran-api المفتوحة (تنزيل/مجمع
// الملك فهد أصلاً)، مع صفحة مصحف المدينة والجزء لكل آية، ونسخة مطبَّعة للمطابقة.
// يُحمَّل مرة ويُخدَم من الذاكرة. لا يُعدَّل النصّ هنا بأي حال.
const here = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => JSON.parse(fs.readFileSync(path.join(here, f), "utf8"));

const data = read("quran.json");
export const SIMILAR = read("similar.json");

const stripTail = (name) => name.replace(/[ً-ْ]+$/, ""); // الكسرة الأخيرة من الإضافة في «سورةُ الفاتحةِ»
export const SURAS = data.suras.map((s) => ({ ...s, name: stripTail(s.name) }));
// النسخة المطبَّعة تُحسب هنا بقاعدة المطابقة نفسها، لا تُقرأ من الملف
export const AYAHS = data.ayahs.map((a) => ({ ...a, n: normalize(a.t) }));

const bySura = new Map();
const byPage = new Map();
const byJuz = new Map();
for (const a of AYAHS) {
  if (!bySura.has(a.s)) bySura.set(a.s, []);
  bySura.get(a.s).push(a);
  if (!byPage.has(a.p)) byPage.set(a.p, []);
  byPage.get(a.p).push(a);
  if (!byJuz.has(a.j)) byJuz.set(a.j, []);
  byJuz.get(a.j).push(a);
}

export const key = (s, a) => `${s}:${a}`;
export const suraAyahs = (n) => bySura.get(Number(n)) || [];
export const pageAyahs = (p) => byPage.get(Number(p)) || [];
export const juzAyahs = (j) => byJuz.get(Number(j)) || [];
export const ayah = (s, a) => suraAyahs(s).find((x) => x.a === Number(a)) || null;
export const PAGES = 604;
export const JUZS = 30;
