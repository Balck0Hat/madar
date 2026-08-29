// يحجز أسئلة الامتحان في ملفات المحتوى: node scripts/mark-exam-questions.js [--check]
// لماذا: الامتحان كان يسحب من البنك نفسه الذي تمرّن عليه المتعلم، فصار قياساً للحفظ
// لا للفهم. هنا نعلّم 6 أسئلة مغلقة في كل وحدة بـexamOnly لتُستثنى من التمرين.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../shared/data/seed/units");
const RESERVE = 6;

// ترتيب طبيعي (q9 قبل q10) حتى يبقى الاختيار حتمياً ومستقلاً عن ترتيب الملف
const byQid = (a, b) => String(a.qid).localeCompare(String(b.qid), "en", { numeric: true });

// الأسئلة المفتوحة تُصحَّح نصياً فلا تصلح للامتحان؛ نأخذ آخر 6 مغلقة بترتيب qid
export function reservedQids(questions) {
  const closed = questions.filter((q) => q.t !== "open" && q.qid).sort(byQid);
  return new Set(closed.slice(-RESERVE).map((q) => q.qid));
}

// تعديل نصي محض: نُزيل العلامات القديمة ثم نضيفها بعد qid مباشرة.
// النزع أولاً يجعل إعادة التشغيل عديمة الأثر (idempotent) ولا يمس نصاً عربياً.
export function markSource(src, targets) {
  const clean = src.replace(/examOnly:\s*true,\s*/g, "");
  return clean.replace(/(\{\s*qid:\s*"([^"]+)"\s*,\s*)/g, (m, head, qid) => (targets.has(qid) ? `${head}examOnly: true, ` : head));
}

async function run() {
  const check = process.argv.includes("--check");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js")).sort();
  let changed = 0, short = 0;
  for (const file of files) {
    const full = path.join(dir, file);
    const { default: unit } = await import(pathToFileURL(full).href);
    const targets = reservedQids(unit.questions || []);
    if (targets.size < RESERVE) { short++; console.log(`⚠ ${file}: ${targets.size} أسئلة مغلقة فقط`); }
    const src = fs.readFileSync(full, "utf8");
    const out = markSource(src, targets);
    if (out === src) continue;
    changed++;
    if (!check) fs.writeFileSync(full, out, "utf8");
  }
  console.log(`${changed}/${files.length} ${check ? "بحاجة إلى تعديل" : "ملفاً عُدّل"} · ${RESERVE} أسئلة محجوزة لكل وحدة${short ? ` · ${short} وحدة ناقصة` : ""}`);
  process.exit(check && changed ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await run();
