import { models } from "../../shared/utils/models.js";
import { sample } from "../../shared/utils/grading.js";

// بنك الامتحان المحجوز: أسئلة examOnly وحدها، وهي لا تُعرض في اختبارات الوحدات،
// فما يقيسه الامتحان هو الفهم المنقول لا حفظ بنك تمرّن عليه المتعلم مراراً.
export const isExamOnly = (q) => q.examOnly === true && q.t !== "open";

export async function examPool(unitIds) {
  const docs = await models
    .Unit()
    .find({ unitId: { $in: unitIds }, published: true })
    .select("unitId questions")
    .lean();
  return docs.flatMap((d) => (d.questions || []).filter(isExamOnly).map((q) => ({ ...q, unitId: d.unitId })));
}

// خلط الخيارات داخل السؤال: من رأى السؤال مرة لا يستطيع تذكّر «موضع» الإجابة،
// ومؤشر الإجابة يُعاد حسابه على الترتيب الجديد لأن التصحيح يتم على النسخة المعروضة.
export function shuffleOptions(q) {
  if (q.t === "mcq" && q.opts?.length > 1) {
    const order = sample(q.opts.map((_, i) => i), q.opts.length);
    return { ...q, opts: order.map((i) => q.opts[i]), a: order.indexOf(q.a) };
  }
  if (q.t === "order" && q.items?.length > 1 && Array.isArray(q.a)) {
    const order = sample(q.items.map((_, i) => i), q.items.length);
    const posOf = new Map(order.map((original, next) => [original, next]));
    return { ...q, items: order.map((i) => q.items[i]), a: q.a.map((i) => posOf.get(i)) };
  }
  return q;
}

// ما يصل إلى المتصفح: بلا إجابة ولا شرح ولا كلمات مفتاحية ولا علامة الحجز
export const strip = ({ a, keywords, why, examOnly, ...q }) => q;
