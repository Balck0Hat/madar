// يدقق ملفات المحتوى في shared/data/seed/units قبل الزرع: node scripts/validate-seed.js [unitId ...]
import { loadSeedUnits } from "../shared/data/seed/index.js";
import { unitBody } from "../features/content/content.validation.js";
import { isValidUnitId, parseUnitId } from "../shared/utils/units.js";
import { titleOf } from "../shared/data/tree.js";

const LIMITS = { 0: { q: 24, c: 7, w: 135 }, 1: { q: 30, c: 11, w: 155 }, 2: { q: 32, c: 13, w: 165 } };
const words = (s) => (s || "").trim().split(/\s+/).filter(Boolean).length;

function checkUnit(u) {
  const errs = [];
  const ring = u.unitId.startsWith("center") ? 0 : Number(u.unitId.split("-")[1]) - 1;
  const { q: MIN_Q, c: MIN_CARDS, w: MAX_WORDS } = LIMITS[ring] || LIMITS[0];
  if (!isValidUnitId(u.unitId)) errs.push("معرّف غير صالح");
  if (!titleOf(u.unitId)) errs.push("لا عنوان في الشجرة");
  const parsed = unitBody.strict().safeParse((({ unitId, ...rest }) => rest)(u));
  if (!parsed.success) errs.push(...parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
  if ((u.cards || []).length < MIN_CARDS) errs.push(`البطاقات ${u.cards?.length || 0} < ${MIN_CARDS}`);
  (u.cards || []).forEach((c, i) => { if (words(c.p) > MAX_WORDS) errs.push(`بطاقة ${i + 1}: ${words(c.p)} كلمة > ${MAX_WORDS}`); });
  const qs = u.questions || [];
  if (qs.length < MIN_Q) errs.push(`الأسئلة ${qs.length} < ${MIN_Q}`);
  const ids = new Set();
  qs.forEach((q) => { if (ids.has(q.qid)) errs.push(`qid مكرر ${q.qid}`); ids.add(q.qid); });
  const types = qs.reduce((m, q) => ({ ...m, [q.t]: (m[q.t] || 0) + 1 }), {});
  if (!types.mcq || types.mcq < 10) errs.push("أقل من 10 أسئلة اختيار");
  if ((types.open || 0) < 1) errs.push("لا سؤال مفتوح");
  if ((types.open || 0) > 3) errs.push("أكثر من 3 أسئلة مفتوحة");
  qs.filter((q) => q.t === "open").forEach((q) => { if (!(q.keywords?.length >= 3)) errs.push(`${q.qid}: سؤال مفتوح بلا 3 كلمات مفتاحية`); });
  qs.filter((q) => q.t === "mcq").forEach((q) => { if (new Set(q.opts).size !== q.opts.length) errs.push(`${q.qid}: خيارات مكررة`); });
  if (!(u.summary?.length >= 3)) errs.push("الخلاصة أقل من 3 نقاط");
  if (!(u.goals?.length >= 3)) errs.push("الأهداف أقل من 3");
  if (!u.spark || words(u.spark) < 25) errs.push("الشرارة قصيرة");
  if (u.thread) {
    const p = parseUnitId(u.thread.to), me = parseUnitId(u.unitId);
    if (!p) errs.push("thread.to غير صالح");
    else if (!p.center && !me.center && p.domain === me.domain) errs.push("thread.to في المجال نفسه");
    if (!(u.thread.a >= 0 && u.thread.a < (u.thread.opts || []).length)) errs.push("thread.a خارج الخيارات");
  } else errs.push("لا خيط");
  return errs;
}

const only = process.argv.slice(2);
const units = (await loadSeedUnits()).filter((u) => !only.length || only.includes(u.unitId));
let bad = 0;
for (const u of units) {
  const errs = checkUnit(u);
  const q = u.questions.length, c = u.cards.length, w = u.cards.reduce((s, x) => s + words(x.p), 0);
  if (errs.length) { bad++; console.log(`✗ ${u.unitId}\n   - ${errs.join("\n   - ")}`); }
  else console.log(`✓ ${u.unitId}  (${c} بطاقات، ${w} كلمة، ${q} سؤال)`);
}
console.log(`\n${units.length - bad}/${units.length} valid`);
process.exit(bad ? 1 : 0);
