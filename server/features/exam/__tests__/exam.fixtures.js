import Unit from "../../content/unit.model.js";
import User from "../../users/user.model.js";
import Progress from "../../progress/progress.model.js";
import { DOMAIN_IDS } from "../../../shared/data/curriculum.js";
import { uid } from "../../../shared/utils/units.js";
import { SEED_UNITS } from "../../../shared/data/seed/index.js";

const ring1 = () => {
  const ids = ["center-1", "center-2", "center-3"];
  DOMAIN_IDS.forEach((d) => { for (let i = 0; i < 8; i++) ids.push(uid(d, 0, i)); });
  return ids;
};

export async function userWithRing1Done(email = "layan@example.com") {
  const user = await User.create({ name: "ليان", email, password: "pass1234" });
  const progress = new Map(ring1().map((id) => [id, { score: 10, total: 10, perfect: false, sim: true }]));
  await Progress.create({ user: user._id, progress });
  return user;
}

// دفعة واحدة لا 243 تحديثاً متتابعاً: البطء يترك البنك ناقصاً فيفشل سحب أربعين سؤالاً
const ops = SEED_UNITS.map((u) => ({ updateOne: { filter: { unitId: u.unitId }, update: { $set: u }, upsert: true } }));
export const seedUnits = () => Unit.bulkWrite(ops, { ordered: false });

// بنك الأسئلة الأصلي: الامتحان يخلط الخيارات، فالإجابة الصحيحة تُستخرج بنص الخيار لا بموضعه
export const bank = new Map();
for (const u of SEED_UNITS) u.questions.forEach((q) => bank.set(`${u.unitId}:${q.qid}`, q));

function correctAnswer(served) {
  const src = bank.get(`${served.unitId}:${served.qid}`);
  if (served.t === "mcq") return served.opts.indexOf(src.opts[src.a]);
  if (served.t === "order") return src.a.map((i) => served.items.indexOf(src.items[i]));
  if (served.t === "fill") return src.a[0];
  return src.a;
}

export const answersFor = (questions) => questions.map((q) => ({ unitId: q.unitId, qid: q.qid, answer: correctAnswer(q) }));
export const wrongAnswers = (questions) => questions.map((q) => ({ unitId: q.unitId, qid: q.qid, answer: "خطأ" }));

// الإجابات صارت تُحفظ واحدة واحدة أثناء المحاولة، والتسليم يصحّح ما حُفظ.
// هذا المساعد يعيد إنتاج المسار الحقيقي في الاختبارات.
export async function answerAll(exam, userId, attemptId, answers) {
  for (const a of answers) await exam.saveAnswer(userId, attemptId, a);
}
