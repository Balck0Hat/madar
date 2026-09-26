import { bandFor } from "../../shared/data/english/tracks/index.js";

// تصحيح أسئلة المسارات بأنواعها، وحساب درجة الوحدة. خالٍ من قاعدة البيانات.
const norm = (t) => String(t ?? "").toLowerCase().replace(/[^a-z0-9\s'-]/g, "").replace(/\s+/g, " ").trim();

// يعيد { score (0..1), a } — a: الإجابة الصحيحة لتُعرض
export function gradeQuestion(q, choice) {
  const type = q.type || "mc";
  if (type === "gap") {
    const got = norm(choice);
    const words = got ? got.split(" ").length : 0;
    const ok = Boolean(got) && words <= (q.limit || 3) && q.answers.map(norm).includes(got);
    return { score: ok ? 1 : 0, a: q.answers[0] };
  }
  if (type === "multi") {
    const picked = Array.isArray(choice) ? choice.map(Number) : [];
    const want = new Set(q.a);
    const hits = picked.filter((i) => want.has(i)).length;
    const wrongs = picked.length - hits;
    return { score: Math.max(0, hits - wrongs) / q.a.length, a: q.a };
  }
  return { score: Number(choice) === q.a ? 1 : 0, a: q.a };
}

// الإجابات لا تخرج قبل التصحيح
export const stripQuestion = ({ a, why, answers, ...q }) => q;

const key = (sectionId, qi) => `${sectionId}#${qi}`;

// تصحيح دفعة إجابات قسم: يعيد لكل سؤال حالته وشرحه، مع ما لم يُجب (يُعدّ صفراً)
export function gradeSection(section, answers) {
  const byKey = new Map(answers.map((x) => [x.itemId, x.choice]));
  return section.qs.map((q, qi) => {
    const itemId = key(section.id, qi);
    const has = byKey.has(itemId);
    const r = has ? gradeQuestion(q, byKey.get(itemId)) : { score: 0, a: q.type === "gap" ? q.answers[0] : q.a };
    return { itemId, k: q.k, type: q.type || "mc", choice: has ? byKey.get(itemId) : null, score: r.score, correct: r.score === 1, a: r.a, why: q.why, skipped: !has };
  });
}

// درجة الوحدة من كل الأقسام المصحّحة
export function scoreModule(mod, graded) {
  const total = mod.sections.reduce((n, s) => n + s.qs.length, 0);
  const raw = Math.round(graded.reduce((n, g) => n + g.score, 0) * 100) / 100;
  const pct = total ? Math.round((raw / total) * 100) : 0;
  const kinds = {};
  for (const g of graded) { const s = kinds[g.k] || (kinds[g.k] = { k: g.k, n: 0, ok: 0 }); s.n++; s.ok += g.score; }
  return { raw, total, pct, band: bandFor(mod.band, raw, total), kinds: Object.values(kinds).map((s) => ({ ...s, ok: Math.round(s.ok * 10) / 10, rate: Math.round((s.ok / s.n) * 100) })).sort((a, b) => a.rate - b.rate) };
}

// درجة تمرين (درس أو نقطة ضعف): أسئلة اختيار فقط
export const scorePractice = (graded) => { const ok = graded.filter((g) => g.correct).length; return { raw: ok, total: graded.length, pct: graded.length ? Math.round((ok / graded.length) * 100) : 0 }; };
