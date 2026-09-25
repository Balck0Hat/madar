import { TAGS, QKINDS } from "../../shared/data/english/tags.js";
import { levelIndex } from "../../shared/data/english/index.js";

// تقرير النتيجة: نقاط القوة والضعف حسب موضوع السؤال (وسم كل سؤال قواعد)
// ونوع السؤال (قراءة واستماع)، ثم خطة أسبوعين مبنية على أضعف ثلاثة مواضيع.
const rateOf = (s) => (s.n ? s.ok / s.n : 0);

function tally(rows, keyOf, labelOf) {
  const map = new Map();
  for (const r of rows) {
    const key = keyOf(r);
    if (!key) continue;
    const s = map.get(key) || { key, label: labelOf(key), n: 0, ok: 0 };
    s.n++; if (r.correct) s.ok++;
    map.set(key, s);
  }
  return [...map.values()].map((s) => ({ ...s, rate: Math.round(rateOf(s) * 100) })).sort((a, b) => rateOf(a) - rateOf(b) || b.n - a.n);
}

// المواضيع: من إجابات القواعد مع وسم كل سؤال
export function skills(answers, itemsById) {
  // الحقول تُقرأ صراحة: نشر مستند Mongoose الفرعي لا ينقل حقوله
  const rows = answers.map((a) => ({ correct: Boolean(a.correct), tag: itemsById.get(a.itemId)?.tag }));
  const all = tally(rows, (r) => r.tag, (t) => TAGS[t]?.label || t);
  return {
    all,
    weak: all.filter((s) => s.n >= 2 && rateOf(s) < 0.6).slice(0, 3),
    strong: all.filter((s) => s.n >= 2 && rateOf(s) >= 0.8).sort((a, b) => b.n - a.n).slice(0, 3),
  };
}

// أنواع الأسئلة: من إجابات القراءة والاستماع مع نوع كل سؤال (k)
export function kinds(parts, pools) {
  const rows = [];
  for (const [stage, part] of Object.entries(parts)) {
    const byId = new Map(pools[stage].map((p) => [p.id, p]));
    for (const a of part.answers) { const [pid, qi] = a.itemId.split("#"); rows.push({ correct: Boolean(a.correct), k: byId.get(pid)?.qs[Number(qi)]?.k }); }
  }
  return tally(rows, (r) => r.k, (k) => QKINDS[k] || k);
}

const LEVEL_BASE = {
  A1: "15 دقيقة يومياً: تطبيق مفردات مصوّر (500 كلمة أساسية) وجملة واحدة تكتبها عن يومك.",
  A2: "اقرأ قصة مبسّطة (graded reader) مستوى A2 صفحتين يومياً، وسجّل صوتك تقرأ فقرة.",
  B1: "بودكاست بطيء للمتعلمين 10 دقائق يومياً، واكتب 5 جمل عمّا سمعت.",
  B2: "مقال إخباري يومياً بصحيفة إنجليزية، لخّصه في 60 كلمة، واحفظ 5 متلازمات منه.",
  C1: "تدرّب بأسئلة الامتحان نفسه مع مؤقّت، وراجع أخطاءك أسبوعياً في دفتر أخطاء.",
};

// خطة أسبوعين: الأسبوع الأول يعالج أضعف المواضيع، والثاني يثبّت بالمهارات الأربع ثم إعادة الاختبار
export function plan(level, weak, weakKinds = []) {
  const tips = weak.map((s) => `${s.label}: ${TAGS[s.key]?.tip || ""}`.trim());
  const kindTip = weakKinds[0] ? `في القراءة والاستماع أضعف نوع عندك «${weakKinds[0].label}»: تدرّب عليه وحده قبل المقاطع الكاملة.` : null;
  const wk1 = [...tips, kindTip, LEVEL_BASE[level]].filter(Boolean);
  const wk2 = [
    "قراءة: مقطعان في مستواك مع أسئلة، مرة كل يومين.",
    "استماع: المقطع نفسه مرتين، الأولى بلا نص والثانية معه.",
    "كتابة: نص من 120 كلمة كل ثلاثة أيام، وأرسله للتصحيح هنا.",
    levelIndex(level) >= 3 ? "ابدأ نماذج الامتحان (آيلتس أو توفل) بالوقت الرسمي." : "أعد اختبار المستوى في نهاية الأسبوع وقارن.",
  ];
  return [{ week: 1, title: "علاج نقاط الضعف", items: wk1 }, { week: 2, title: "تثبيت بالمهارات الأربع", items: wk2 }];
}
