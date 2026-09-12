// يقترح أشكالاً من نصّ البطاقات للمراجعة: node scripts/detect-figures.js [domain] > proposals.json
// لا يكتب في المحتوى. المقترَح يُراجعه إنسان ثم يُلصق في البطاقة حقلاً `fig`.
//
// ثلاثة أنواع لا غير، وكلها تُرسم من أرقام البطاقة أو من وصف صورتها حرفياً:
//   layers   «هرم الملك والنبلاء والفرسان والفلاحين» → طبقات
//   timeline سنوات في النصّ (1896، 1927…) مع الجملة حولها → خطّ زمني
//   bars     أرقام تشترك في وحدة (لتر، كم، مليون…) → أشرطة
import { SEED_UNITS } from "../shared/data/seed/index.js";

const domain = process.argv[2];
const units = SEED_UNITS.filter((u) => !domain || u.unitId.startsWith(`${domain}-`));

const LAYERS = /(?:هرم|طبقات|سلّم|سلم|مستويات)\s+(.+)/;
const YEAR = /(?<![\d.])(1[0-9]{3}|20[0-2][0-9])(?![\d.])/g;
const NUM_UNIT = /(\d+(?:[.,]\d+)?)\s*(?:ألف|مليون|مليار)?\s+(لتر|لترات|كم|كيلومتر|كيلومتراً|متر|متراً|سنة|عاماً|يوماً|دقيقة|ثانية|غرام|كيلوغرام|طن|درجة|بالمئة|في المئة|مرة|مرات|نبضة|عظمة|خلية|جين|نوع|دولة|لغة|شخص|مليون|مليار)/g;

const clauseAround = (text, at, len = 70) => {
  const start = Math.max(0, text.lastIndexOf("،", at) + 1, text.lastIndexOf(".", at) + 1);
  const endCandidates = [text.indexOf("،", at), text.indexOf(".", at), text.indexOf("؛", at)].filter((i) => i > at);
  const end = endCandidates.length ? Math.min(...endCandidates) : text.length;
  return text.slice(start, Math.min(end, start + len)).trim();
};

const proposals = [];
for (const u of units) {
  (u.cards || []).forEach((c, i) => {
    const text = `${c.p} ${(c.points || []).join(" ")} ${c.after || ""}`;
    const id = `${u.unitId}#${i + 1}`;
    // طبقات من الوصف
    const lm = LAYERS.exec(c.img || "");
    if (lm) {
      const items = lm[1].split(/\s+و(?=\S)/).map((s) => s.replace(/^و/, "").trim()).filter(Boolean);
      if (items.length >= 3 && items.length <= 6) proposals.push({ id, h: c.h, kind: "layers", from: c.img, fig: { t: "layers", items } });
    }
    // خطّ زمني من السنوات
    const years = [...new Set([...text.matchAll(YEAR)].map((m) => m[1]))];
    if (years.length >= 3 && years.length <= 8) {
      const items = years.map((y) => ({ y, l: clauseAround(text, text.indexOf(y)) }));
      proposals.push({ id, h: c.h, kind: "timeline", fig: { t: "timeline", items } });
    }
    // أشرطة من أرقام تشترك في وحدة
    const byUnit = {};
    for (const m of text.matchAll(NUM_UNIT)) (byUnit[m[2]] ||= []).push({ v: Number(m[1].replace(",", ".")), l: clauseAround(text, m.index, 40) });
    for (const [unit, vals] of Object.entries(byUnit)) {
      if (vals.length >= 3 && vals.length <= 6 && Math.max(...vals.map((x) => x.v)) / Math.max(1e-9, Math.min(...vals.map((x) => x.v))) <= 50) {
        proposals.push({ id, h: c.h, kind: "bars", fig: { t: "bars", unit, items: vals } });
      }
    }
  });
}
const counts = proposals.reduce((a, p) => ((a[p.kind] = (a[p.kind] || 0) + 1), a), {});
console.error(`${proposals.length} مقترحاً — ${JSON.stringify(counts)}`);
console.log(JSON.stringify(proposals, null, 1));
