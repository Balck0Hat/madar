import { checkClosed } from "../../shared/utils/grading.js";
import { domainOf } from "./exam.pool.js";

// تصحيح المحاولة على النسخة المعروضة (بعد خلط الخيارات)، لا على البنك الأصلي
export function grade(questions, answers) {
  const byKey = new Map((answers || []).map((a) => [`${a.unitId}:${a.qid}`, a.answer]));
  return questions.map((q) => {
    const given = byKey.get(`${q.unitId}:${q.qid}`);
    return {
      unitId: q.unitId,
      qid: q.qid,
      q: q.q,
      answered: given !== undefined && given !== null && given !== "",
      ok: checkClosed(q, given),
      given,
      a: q.a,
      why: q.why || "",
    };
  });
}

// حصيلة كل مجال: صحيح من مطروح. تُعطى للراسب كي يعرف أين يراجع.
export function byDomain(graded) {
  const out = {};
  for (const g of graded) {
    const d = domainOf(g.unitId);
    out[d] ||= { correct: 0, total: 0 };
    out[d].total++;
    if (g.ok) out[d].correct++;
  }
  return out;
}

// ما يصل إلى المتصفّح بعد التسليم.
//
// الناجح يرى المراجعة كاملة: انتهى امتحانه فلا شيء يُحمى منه، والمراجعة
// أنفع ما في التجربة. أما الراسب فسيُمتحن ثانية من البنك المحجوز نفسه بعد
// ثلاثين يوماً، فإعطاؤه مفتاح الأربعين يحوّل الإعادة إلى اختبار حفظ.
// يأخذ بدلها خريطة مجالاته: تدلّه على ما يراجع بلا أن تسبق الإجابة.
//
// وكان الخادم قبل ذلك يرسل a وwhy لكل سؤال في الحالتين، والواجهة لا تقرؤها
// أصلاً — تسريب للبنك المحجوز مقابل لا شيء.
export function feedback(graded, passed) {
  if (passed) return { review: graded };
  return { review: null, domains: byDomain(graded) };
}
