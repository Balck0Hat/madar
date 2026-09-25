import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// محتوى الإنجليزية: بنك اختبار المستوى (قواعد ومفردات، قراءة، استماع، كتابة).
// يُحمَّل مرة ويُخدَم من الذاكرة؛ الإجابات لا تخرج للعميل إلا بعد الإجابة.
const here = path.dirname(fileURLToPath(import.meta.url));

async function load(rel) {
  const file = path.join(here, rel);
  if (!fs.existsSync(file)) return [];
  return (await import(pathToFileURL(file).href)).default;
}

export const LEVELS = ["A1", "A2", "B1", "B2", "C1"];
export const levelIndex = (l) => Math.max(0, LEVELS.indexOf(l));

// تقدير الآيلتس والتوفل من المستوى الأوروبي: نطاقات تقريبية متعارف عليها، لا درجة رسمية
export const BANDS = {
  A1: { ielts: "أقل من 3", toefl: "أقل من 30", label: "مبتدئ" },
  A2: { ielts: "3 إلى 4", toefl: "30 إلى 41", label: "أساسي" },
  B1: { ielts: "4 إلى 5", toefl: "42 إلى 71", label: "متوسط" },
  B2: { ielts: "5.5 إلى 6.5", toefl: "72 إلى 94", label: "فوق المتوسط" },
  C1: { ielts: "7 إلى 8", toefl: "95 إلى 113", label: "متقدم" },
  C2: { ielts: "8.5 إلى 9", toefl: "114 إلى 120", label: "إتقان" },
};

export const PLACEMENT = {
  grammar: await load("placement/grammar.js"),
  reading: await load("placement/reading.js"),
  listening: await load("placement/listening.js"),
  writing: await load("placement/writing.js"),
};
