// فحص بنيوي أعمق من validate-seed: يلتقط إجابات فاسدة وتكراراً وتناقضات
// node scripts/audit-content.js
import { loadSeedUnits } from "../shared/data/seed/index.js";
import { checkClosed } from "../shared/utils/grading.js";
import { readdir, readFile } from "node:fs/promises";

const issues = [];
const add = (unitId, where, msg) => issues.push({ unitId, where, msg });

const units = await loadSeedUnits();
for (const u of units) {
  const seenQ = new Map();
  for (const q of u.questions) {
    // نص سؤال مكرر داخل الوحدة: يجعل الاختبار العشوائي يعرض السؤال نفسه مرتين
    const key = q.q.replace(/\s+/g, " ").trim();
    if (seenQ.has(key)) add(u.unitId, q.qid, `سؤال مكرر مع ${seenQ.get(key)}`);
    seenQ.set(key, q.qid);

    if (!q.why || q.why.trim().length < 10) add(u.unitId, q.qid, "تفسير مفقود أو قصير جداً");

    switch (q.t) {
      case "mcq": {
        if (!Number.isInteger(q.a) || q.a < 0 || q.a >= (q.opts || []).length) add(u.unitId, q.qid, "مؤشر الإجابة خارج الخيارات");
        const lens = (q.opts || []).map((o) => o.length);
        // خيار أطول بكثير من البقية يكشف الإجابة الصحيحة بلا تفكير
        if (lens.length && Math.max(...lens) > Math.min(...lens) * 3.2 && lens.indexOf(Math.max(...lens)) === q.a) add(u.unitId, q.qid, "الخيار الصحيح أطول بكثير من البقية (يكشف الإجابة)");
        if ((q.opts || []).some((o) => /^(كل ما سبق|جميع ما سبق|لا شيء مما سبق)$/.test(o.trim()))) add(u.unitId, q.qid, "خيار «كل ما سبق» ممنوع");
        break;
      }
      case "tf":
        if (typeof q.a !== "boolean") add(u.unitId, q.qid, "إجابة صح/خطأ ليست منطقية");
        break;
      case "fill":
        if (!Array.isArray(q.a) || !q.a.length || q.a.some((x) => !String(x).trim())) add(u.unitId, q.qid, "قائمة إجابات الفراغ فارغة");
        else if (q.a.some((x) => String(x).trim().split(/\s+/).length > 4)) add(u.unitId, q.qid, "إجابة فراغ طويلة (يصعب مطابقتها)");
        break;
      case "order": {
        const n = (q.items || []).length;
        const sorted = [...(q.a || [])].sort((x, y) => x - y);
        if (n < 2 || sorted.length !== n || sorted.some((v, i) => v !== i)) add(u.unitId, q.qid, "ترتيب الإجابة ليس تبديلاً صحيحاً للعناصر");
        break;
      }
      case "open":
        if (!(q.keywords || []).length) add(u.unitId, q.qid, "سؤال مفتوح بلا كلمات مفتاحية");
        break;
      default:
        add(u.unitId, q.qid, `نوع سؤال غير معروف: ${q.t}`);
    }
    // تحقّق أن المصحّح نفسه يقبل الإجابة المعلنة (يكشف عدم توافق النوع والقيمة)
    if (q.t !== "open" && !checkClosed(q, q.a)) add(u.unitId, q.qid, "المصحّح يرفض الإجابة المعلنة");
  }

  const seenCard = new Set();
  u.cards.forEach((c, i) => {
    if (seenCard.has(c.h)) add(u.unitId, `card${i + 1}`, `عنوان بطاقة مكرر: ${c.h}`);
    seenCard.add(c.h);
  });
  if (u.thread && u.thread.to === u.unitId) add(u.unitId, "thread", "الخيط يشير إلى الوحدة نفسها");
}

// فحص على النصّ المصدري لا على القيم: مفتاح إجابة مكتوب كتعبير («a: true === false»)
// يُقيَّم إلى قيمة سليمة، فلا يراه أي فحص يعمل على الوحدة بعد تحميلها.
const SCALAR = `(?:true|false|-?\\d+(?:\\.\\d+)?|"[^"]*"|'[^']*')`;
// المصفوفة تُطابَق كاملة لا تُقسَم على الفواصل: نصّ مثل "17,000" يحمل فاصلة داخله
const LITERAL = new RegExp(`^(?:${SCALAR}|\\[\\s*(?:${SCALAR}(?:\\s*,\\s*${SCALAR})*\\s*)?\\])$`);
const isLiteral = (v) => LITERAL.test(v.trim());
const dir = new URL("../shared/data/seed/units/", import.meta.url);
for (const file of (await readdir(dir)).filter((f) => f.endsWith(".js"))) {
  const src = await readFile(new URL(file, dir), "utf8");
  for (const m of src.matchAll(/qid: "([^"]+)"[^}]*?\ba:\s*(\[[^\]]*\]|[^,}\n]+)/g)) {
    if (!isLiteral(m[2])) add(file.replace(/\.js$/, ""), m[1], `مفتاح إجابة ليس قيمة صريحة: a: ${m[2].trim()}`);
  }
}

const byUnit = issues.reduce((m, i) => ({ ...m, [i.unitId]: [...(m[i.unitId] || []), i] }), {});
for (const [unitId, list] of Object.entries(byUnit)) {
  console.log(`\n✗ ${unitId}`);
  list.forEach((i) => console.log(`   ${i.where}: ${i.msg}`));
}
console.log(`\n${issues.length} مشكلة بنيوية في ${Object.keys(byUnit).length} وحدة من ${units.length}`);
process.exit(issues.length ? 1 : 0);
