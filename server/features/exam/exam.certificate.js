import Certificate from "./certificate.model.js";
import { models } from "../../shared/utils/models.js";
import { randomCode } from "../../shared/utils/tokens.js";
import { bus } from "../../shared/utils/events.js";

export const XP_CERT = 500;

// شهادة واحدة برمز ثابت: الإعادة تحسّن العلامة ولا تُصدر رمزاً جديداً،
// كي يبقى رمز التحقق الذي شاركه صاحبه صالحاً. وكانت الإعادة ممنوعة أصلاً،
// فمن نال 32 من 40 لم يكن يملك سبيلاً إلى تحسينها أبداً.
export async function issue(userId, score, total) {
  const existing = await Certificate.findOne({ user: userId });
  if (existing) {
    if (score > existing.score) { existing.score = score; existing.total = total; await existing.save(); }
    return { code: existing.code, issuedAt: existing.issuedAt, score: existing.score, total: existing.total };
  }
  const user = await models.User().findById(userId).select("name").lean();
  const doc = await Certificate.create({ user: userId, code: `MDR-${new Date().getFullYear()}-${randomCode(5)}`, name: user.name, score, total });
  bus.emit("xp.grant", { userId, amount: XP_CERT, reason: "شهادة إتمام المدار الأول" });
  return { code: doc.code, issuedAt: doc.issuedAt, score, total };
}

export async function verify(code) {
  const cert = await Certificate.findOne({ code }).lean();
  if (!cert) return { valid: false };
  return { valid: true, name: cert.name, issuedAt: cert.issuedAt, score: cert.score, total: cert.total, proctored: false };
}
