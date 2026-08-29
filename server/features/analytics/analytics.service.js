import UnitEvent from "./unitEvent.model.js";
import { funnelRows } from "./analytics.funnel.js";
import { models } from "../../shared/utils/models.js";

// تقليب البطاقة ذهاباً وإياباً ليس قراءتين: نكتم تكرار نفس الصفحة داخل دقيقة
export const DEDUPE_MS = 60_000;

export async function record(userId, { unitId, kind, page = 0 }) {
  if (kind === "page") {
    const since = new Date(Date.now() - DEDUPE_MS);
    const dup = await UnitEvent.exists({ user: userId, unitId, kind, page, createdAt: { $gte: since } });
    if (dup) return { recorded: false, reason: "duplicate" };
  }
  // الصفحة بلا معنى لغير أحداث الصفحات؛ تصفيرها يبقي التجميع بسيطاً
  await UnitEvent.create({ user: userId, unitId, kind, page: kind === "page" ? page : 0 });
  return { recorded: true };
}

// صف واحد لكل (قارئ، وحدة): أقصى صفحة بلغها وأي مراحل مرّ بها
async function readerRows(days) {
  return UnitEvent.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - days * 864e5) } } },
    {
      $group: {
        _id: { unitId: "$unitId", user: "$user" },
        furthest: { $max: { $cond: [{ $eq: ["$kind", "page"] }, "$page", 0] } },
        opened: { $max: { $cond: [{ $eq: ["$kind", "open"] }, 1, 0] } },
        quizStarted: { $max: { $cond: [{ $eq: ["$kind", "quiz_start"] }, 1, 0] } },
        finished: { $max: { $cond: [{ $eq: ["$kind", "finish"] }, 1, 0] } },
      },
    },
  ]).then((rows) =>
    rows.map((r) => ({
      unitId: r._id.unitId,
      furthest: r.furthest,
      opened: Boolean(r.opened),
      quizStarted: Boolean(r.quizStarted),
      finished: Boolean(r.finished),
    })),
  );
}

async function titlesOf(unitIds) {
  const units = await models.Unit().find({ unitId: { $in: unitIds } }).select("unitId title").lean();
  return new Map(units.map((u) => [u.unitId, u.title]));
}

export async function funnel({ days = 90, limit = 20 } = {}) {
  const rows = funnelRows(await readerRows(days)).slice(0, limit);
  const titles = await titlesOf(rows.map((r) => r.unitId));
  return { days, units: rows.map((r) => ({ ...r, title: titles.get(r.unitId) || r.unitId })) };
}

// عيّنة دنيا كي لا يتصدّر القائمةَ سؤالٌ عُرض مرتين وأُخطئ مرتين
export const MIN_ASKED = 5;

export async function hardQuestions({ min = MIN_ASKED, limit = 30 } = {}) {
  const stats = await models.QuestionStat().find({ asked: { $gte: min }, wrong: { $gt: 0 } }).lean();
  const worst = stats
    .map((s) => ({ unitId: s.unitId, qid: s.qid, asked: s.asked, wrong: s.wrong, rate: Math.round((s.wrong / s.asked) * 100) }))
    .sort((a, b) => b.rate - a.rate || b.asked - a.asked)
    .slice(0, limit);
  const unitIds = [...new Set(worst.map((w) => w.unitId))];
  const units = await models.Unit().find({ unitId: { $in: unitIds } }).select("unitId title questions.qid questions.q").lean();
  const byUnit = new Map(units.map((u) => [u.unitId, u]));
  const groups = unitIds
    .map((unitId) => {
      const unit = byUnit.get(unitId);
      const text = new Map((unit?.questions || []).map((q) => [q.qid, q.q]));
      // نص السؤال يُوصِل الفكرة للمشرف؛ المعرّف وحده لا يقول شيئاً
      const questions = worst.filter((w) => w.unitId === unitId).map((w) => ({ ...w, q: text.get(w.qid) || null }));
      return { unitId, title: unit?.title || unitId, avgRate: Math.round(questions.reduce((n, q) => n + q.rate, 0) / questions.length), questions };
    })
    .sort((a, b) => b.avgRate - a.avgRate);
  return { minAsked: min, units: groups };
}
