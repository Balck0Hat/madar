import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { titleOf } from "../tree.js";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "units");

// كلمات مفتاحية إضافية للأسئلة المفتوحة القديمة (التصحيح التقريبي)
const KEYWORDS = {
  "human-1-3": { q10: ["تنظيف", "ينظف", "ذاكرة", "تثبيت", "يثبت", "إصلاح", "يصلح", "يرمم", "ترميم", "راحة", "الدماغ", "ينمو", "نمو"] },
  "center-1": { q5: ["استرجاع", "يثبت", "تثبيت", "نتذكر", "تذكر", "الذاكرة", "ننسى", "النسيان"] },
};

// يحمّل كل ملفات seed/units/*.js تلقائياً ويضبط العنوان من الشجرة والمعرّفات
export async function loadSeedUnits() {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".js")).sort() : [];
  const units = [];
  for (const f of files) {
    const mod = await import(pathToFileURL(path.join(dir, f)).href);
    const u = mod.default;
    const unitId = u.unitId || f.replace(/\.js$/, "");
    units.push({
      ...u,
      unitId,
      title: titleOf(unitId) || u.title,
      questions: (u.questions || []).map((q, i) => ({ qid: q.qid || `q${i + 1}`, ...q, ...(KEYWORDS[unitId]?.[q.qid] ? { keywords: KEYWORDS[unitId][q.qid] } : {}) })),
      published: u.published !== false,
    });
  }
  return units;
}

export const SEED_UNITS = await loadSeedUnits();
