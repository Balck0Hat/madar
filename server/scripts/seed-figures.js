// يزرع شخصيات التاريخ في القاعدة: node scripts/seed-figures.js
// يستبدل دائماً: مصدر الحقيقة ملفات shared/data/figures/people
import { connectDb, disconnectDb } from "../shared/database/connect.js";
import { seed } from "../features/figures/figures.service.js";
import { FIGURES } from "../shared/data/figures/index.js";
import { SEED_UNITS } from "../shared/data/seed/index.js";
import { mentionCount } from "../shared/utils/mentions.js";

const MAX_UNITS = 6;

// الدروس التي تذكر الشخصية باسمها، الأكثر ذكراً أولاً
function unitsMentioning(figure) {
  return SEED_UNITS
    .filter((u) => u.published !== false)
    .map((u) => ({ unitId: u.unitId, title: u.title, n: mentionCount([u.spark, ...(u.cards || []).flatMap((c) => [c.h, c.p]), ...(u.summary || [])].join(" "), figure.name) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, MAX_UNITS)
    .map(({ unitId, title }) => ({ unitId, title }));
}

const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;

async function main() {
  const errs = [];
  for (const f of FIGURES) {
    const story = (f.story || []).reduce((n, s) => n + words(s.p), 0);
    if (!f.figureId || !f.name || !f.why || !f.quick) errs.push(`${f.figureId}: حقول ناقصة`);
    if (words(f.quick) < 150) errs.push(`${f.figureId}: الملخص ${words(f.quick)} كلمة < 150`);
    if (story < 900) errs.push(`${f.figureId}: القصة ${story} كلمة < 900`);
    if ((f.story || []).length < 5) errs.push(`${f.figureId}: أقسام القصة ${f.story?.length || 0} < 5`);
    if (f.image && !/^\/figures\/people\/[\w.-]+\.(?:jpg|png|webp)$/.test(f.image.src)) errs.push(`${f.figureId}: مسار الصورة غير صالح`);
    if (f.check && !(f.check.opts?.length >= 2 && f.check.opts[f.check.a] !== undefined)) errs.push(`${f.figureId}: سؤال ناقص`);
    if (f.geo && !(Math.abs(f.geo.lat) <= 90 && Math.abs(f.geo.lon) <= 180)) errs.push(`${f.figureId}: إحداثيات غير صالحة`);
  }
  if (errs.length) { errs.forEach((e) => console.error("✗", e)); process.exit(1); }
  await connectDb();
  const linked = FIGURES.map((f) => ({ ...f, units: unitsMentioning(f) }));
  linked.forEach((f) => f.units.length && console.log(`  ${f.figureId}: ${f.units.map((u) => u.unitId).join(", ")}`));
  const n = await seed(linked);
  console.log(`[figures] ${n} شخصية زُرعت`);
  await disconnectDb();
}

main().catch((err) => { console.error("[figures] failed", err); process.exit(1); });
