import { sleepUnit } from "./sleep.js";
import { learningUnit } from "./learning.js";

// كلمات مفتاحية للأسئلة المفتوحة (للتصحيح التقريبي عند غياب الذكاء الاصطناعي)
const KEYWORDS = {
  "human-1-3": { q10: ["تنظيف", "ينظف", "ذاكرة", "تثبيت", "يثبت", "إصلاح", "يصلح", "يرمم", "ترميم", "راحة", "الدماغ", "ينمو", "نمو"] },
  "center-1": { q5: ["استرجاع", "يثبت", "تثبيت", "نتذكر", "تذكر", "الذاكرة", "ننسى", "النسيان"] },
};

const withMeta = (unitId, title, unit) => ({
  unitId,
  title,
  ...unit,
  questions: unit.questions.map((q) => (KEYWORDS[unitId]?.[q.qid] ? { ...q, keywords: KEYWORDS[unitId][q.qid] } : q)),
  published: true,
});

export const SEED_UNITS = [
  withMeta("human-1-3", "النوم: لماذا ننام، وكم، وماذا يحدث حين لا ننام", sleepUnit),
  withMeta("center-1", "كيف يتعلم دماغك، وكيف يعمل مدار", learningUnit),
];
