import { models, plainMap } from "../../shared/utils/models.js";
import { stats } from "../../shared/utils/game.js";
import { notFound } from "../../shared/utils/AppError.js";

// ملف عام للمشاركة: الاسم والعجلة والإحصاءات فقط، بلا بريد
export async function profileByHandle(handle) {
  const user = await models.User().findOne({ handle }).select("name handle tier createdAt").lean();
  if (!user) throw notFound("لا يوجد مستخدم بهذا المعرّف", "USER_NOT_FOUND");
  const prog = await models.Progress().findOne({ user: user._id }).select("progress xp streak badges").lean();
  const progress = prog ? plainMap(prog.progress) : {};
  const cert = await models.Certificate().findOne({ user: user._id }).select("code issuedAt").lean();
  return {
    name: user.name,
    handle: user.handle,
    tier: user.tier,
    since: user.createdAt,
    xp: prog?.xp || 0,
    streak: prog?.streak || 0,
    badges: prog?.badges || [],
    progressIds: Object.keys(progress),
    stats: stats(progress),
    certificate: cert ? { code: cert.code, issuedAt: cert.issuedAt } : null,
  };
}
