import { models } from "../../shared/utils/models.js";
import { notFound } from "../../shared/utils/AppError.js";
import { aiEnabled } from "../../shared/utils/ai.js";
import { env } from "../../shared/config/env.js";

// لوحة الإحصاءات: أعداد عامة + أكثر الأسئلة خطأً
export async function overview() {
  const User = models.User(), Progress = models.Progress(), Unit = models.Unit(), QS = models.QuestionStat(), Cert = models.Certificate();
  const weekAgo = new Date(Date.now() - 7 * 864e5);
  const [users, activeWeek, newWeek, published, drafts, certificates, prog, hard] = await Promise.all([
    User.countDocuments(),
    Progress.countDocuments({ updatedAt: { $gte: weekAgo } }),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
    Unit.countDocuments({ published: true }),
    Unit.countDocuments({ published: false }),
    Cert.countDocuments(),
    Progress.aggregate([
      { $project: { n: { $size: { $objectToArray: { $ifNull: ["$progress", {}] } } }, xp: 1 } },
      { $group: { _id: null, units: { $sum: "$n" }, xp: { $sum: "$xp" } } },
    ]),
    QS.find({ asked: { $gte: 3 } }).sort({ wrong: -1 }).limit(10).lean(),
  ]);
  const unitIds = [...new Set(hard.map((h) => h.unitId))];
  const units = await Unit.find({ unitId: { $in: unitIds } }).select("unitId title questions.qid questions.q").lean();
  const qText = new Map(units.flatMap((u) => u.questions.map((q) => [`${u.unitId}:${q.qid}`, { unit: u.title, q: q.q }])));
  const hardQuestions = hard.map((h) => ({ unitId: h.unitId, qid: h.qid, asked: h.asked, wrong: h.wrong, rate: Math.round((h.wrong / h.asked) * 100), ...(qText.get(`${h.unitId}:${h.qid}`) || {}) }));
  return {
    users, activeWeek, newWeek, published, drafts, certificates,
    unitsCompleted: prog[0]?.units || 0, totalXp: prog[0]?.xp || 0,
    hardQuestions,
    integrations: { ai: aiEnabled(), push: env.pushEnabled, google: env.googleEnabled },
  };
}

export async function setRole(email, role) {
  const user = await models.User().findOneAndUpdate({ email }, { $set: { role } }, { new: true });
  if (!user) throw notFound("لا يوجد مستخدم بهذا البريد", "USER_NOT_FOUND");
  return user.toPublic();
}

export async function recentUsers(limit = 20) {
  return models.User().find().select("name email handle role tier createdAt").sort("-createdAt").limit(limit).lean();
}
