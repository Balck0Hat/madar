// شكل الوحدة «النظيف»: ما يُصدَّر ويُلقَط ويُستورد — بلا حقول مونغو الداخلية.
// قائمة صريحة لا حذف بالاستثناء، حتى لا يتسرّب حقل جديد إلى التصدير بالخطأ.
const KEYS = ["unitId", "title", "hero", "spark", "goals", "cards", "tryIt", "deep", "thread", "summary", "questions", "published"];

// الحقول الاختيارية: عند الاستعادة يجب أن تُحذف إن غابت عن اللقطة، لا أن تبقى من الحالة الحالية
export const OPTIONAL_KEYS = ["hero", "spark", "tryIt", "deep", "thread"];

export function cleanUnit(unit) {
  const out = {};
  for (const key of KEYS) if (unit?.[key] !== undefined && unit?.[key] !== null) out[key] = unit[key];
  return out;
}

export const unitCounts = (unit) => ({ cards: unit?.cards?.length || 0, questions: unit?.questions?.length || 0 });
