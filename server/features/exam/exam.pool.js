import { models } from "../../shared/utils/models.js";
import { sample } from "../../shared/utils/grading.js";
import { allocate } from "../../shared/utils/allocate.js";

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

// المجال الذي ينتمي إليه السؤال: المركز فئة قائمة بذاتها
export const domainOf = (unitId) => (unitId.startsWith("center") ? "center" : unitId.split("-")[0]);

// سحب موزَّع على المجالات بنسبة أحجامها، وبحدّ أدنى سؤال لكل مجال.
//
// السحب الحرّ من بركة واحدة كان يترك مجالات بلا سؤال واحد: في محاكاة ألفي
// امتحان على البركة الفعلية (498 سؤالاً من 11 مجالاً) غاب مجال كامل أو أكثر
// عن 88.7% من الامتحانات، وبلغ الغياب سبعة مجالات في أسوأ حالة. وشهادة
// «إتمام المدار الأول» لا يصحّ أن تُمنح على امتحان لم يمسّ نصف الخريطة.
export function drawExam(pool, size) {
  const byDomain = {};
  for (const q of pool) (byDomain[domainOf(q.unitId)] ||= []).push(q);
  const counts = Object.fromEntries(Object.entries(byDomain).map(([d, qs]) => [d, qs.length]));
  const take = allocate(counts, size, { floor: 1 });
  const picked = Object.entries(take).flatMap(([d, n]) => (n > 0 ? sample(byDomain[d], n) : []));
  // خلط الخيارات جزء من السحب لا خطوة تُنادى بعده: فصلهما أسقطه سهواً مرة،
  // فصار موضع الإجابة ثابتاً بين محاولة وأخرى.
  // والترتيب النهائي مخلوط كي لا تصل أسئلة المجال الواحد متتالية.
  return sample(picked, picked.length).map(shuffleOptions);
}
