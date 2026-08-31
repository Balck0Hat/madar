// يحجز أسئلة الامتحان في ملفات المحتوى: node scripts/mark-exam-questions.js [--check]
// لماذا: الامتحان كان يسحب من البنك نفسه الذي تمرّن عليه المتعلم، فصار قياساً للحفظ
// لا للفهم. هنا نعلّم 6 أسئلة مغلقة في كل وحدة بـexamOnly لتُستثنى من التمرين.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../shared/data/seed/units");
const RESERVE = 6;
const TYPES = ["mcq", "tf", "fill", "order"];

// ترتيب طبيعي (q9 قبل q10) حتى يبقى الاختيار حتمياً ومستقلاً عن ترتيب الملف
const byQid = (a, b) => String(a.qid).localeCompare(String(b.qid), "en", { numeric: true });

// حصّة كل نوع بنسبته في البنك، بطريقة أكبر البواقي.
// الاختيار السابق — آخر ستة بترتيب qid — كان يتبع ترتيب الكتابة لا التوازن،
// وأسئلة الإكمال والترتيب تُكتب في آخر البنك عادةً، فخرج امتحان 59% منه
// إكمال وترتيب بينما البنك 14%؛ أي أن المتعلّم يتمرّن على نوع ويُمتحن بآخر.
export function quota(counts, want = RESERVE) {
  const total = TYPES.reduce((sum, t) => sum + (counts[t] || 0), 0);
  if (!total) return {};
  const exact = {}, take = {};
  for (const t of TYPES) {
    exact[t] = ((counts[t] || 0) / total) * want;
    take[t] = Math.min(counts[t] || 0, Math.floor(exact[t]));
  }
  // الباقي للأنواع الأكبر كسراً، ثم الأوفر في البنك، ثم أبجدياً — كله حتمي
  const rank = [...TYPES].sort((a, b) =>
    (exact[b] % 1) - (exact[a] % 1) || (counts[b] || 0) - (counts[a] || 0) || a.localeCompare(b));
  let left = want - TYPES.reduce((sum, t) => sum + take[t], 0);
  while (left > 0) {
    const before = left;
    for (const t of rank) {
      if (left === 0) break;
      if (take[t] < (counts[t] || 0)) { take[t]++; left--; }
    }
    if (left === before) break; // نفد المتاح: الوحدة أقلّ من الحصة
  }
  return take;
}

// الأسئلة المفتوحة تُصحَّح نصياً فلا تصلح للامتحان
export function reservedQids(questions) {
  const closed = questions.filter((q) => q.t !== "open" && q.qid).sort(byQid);
  const byType = {};
  for (const q of closed) (byType[q.t] ||= []).push(q);
  const counts = Object.fromEntries(TYPES.map((t) => [t, (byType[t] || []).length]));
  const take = quota(counts);
  const picked = new Set();
  // من آخر كل نوع: المتأخر في البنك أميل إلى التركيب، والاختيار يبقى حتمياً.
  // الحصة صفراً تُتخطّى صراحةً: slice(-0) هي slice(0) فتعيد النوع كلّه.
  for (const t of TYPES) {
    const n = take[t] || 0;
    if (n > 0) for (const q of (byType[t] || []).slice(-n)) picked.add(q.qid);
  }
  return picked;
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
