import User from "../users/user.model.js";
import { env } from "../../shared/config/env.js";
import { conflict, unauthorized } from "../../shared/utils/AppError.js";
import { signAccess, signRefresh, verifyRefresh, newJti, hashToken, refreshExpiry } from "../../shared/utils/tokens.js";

const roleFor = (email) => (env.adminEmails.includes(email.toLowerCase()) ? "admin" : "user");

// يصدر زوج رموز ويخزّن تجزئة رمز التحديث
async function issueTokens(user) {
  const jti = newJti();
  const refresh = signRefresh(user._id, jti);
  const access = signAccess(user);
  const live = (user.refreshTokens || []).filter((t) => t.expiresAt > new Date()).slice(-9);
  user.refreshTokens = [...live, { jti, hash: hashToken(refresh), expiresAt: refreshExpiry() }];
  await user.save();
  return { access, refresh };
}

export async function register({ name, email, password }) {
  if (await User.exists({ email })) throw conflict("البريد مسجّل من قبل", "EMAIL_TAKEN");
  const user = await User.create({ name, email, password, role: roleFor(email) });
  const tokens = await issueTokens(user);
  return { user: user.toPublic(), tokens };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+password +refreshTokens +failedLogins");
  const ok = user && (await user.comparePassword(password));
  if (!ok) {
    if (user) await User.updateOne({ _id: user._id }, { $inc: { failedLogins: 1 } });
    console.warn(`[auth] failed login for ${email}`);
    throw unauthorized("البريد أو كلمة المرور غير صحيحة", "BAD_CREDENTIALS");
  }
  if (user.role !== "admin" && roleFor(email) === "admin") user.role = "admin";
  const tokens = await issueTokens(user);
  return { user: user.toPublic(), tokens };
}

// دخول بحساب خارجي: يربط بالبريد أو ينشئ مستخدماً جديداً
export async function loginWithProvider(provider, { email, name }) {
  let user = await User.findOne({ email }).select("+refreshTokens");
  const isNew = !user;
  if (!user) user = await User.create({ name, email, provider, role: roleFor(email) });
  const tokens = await issueTokens(user);
  return { user: user.toPublic(), tokens, isNew };
}

// تدوير رمز التحديث: يُبطل القديم ويُصدر زوجاً جديداً
export async function refresh(token) {
  if (!token) throw unauthorized("لا توجد جلسة", "NO_REFRESH");
  let payload;
  try { payload = verifyRefresh(token); } catch (err) { throw unauthorized("انتهت الجلسة", "INVALID_REFRESH"); }
  const user = await User.findById(payload.sub).select("+refreshTokens");
  if (!user) throw unauthorized("انتهت الجلسة", "INVALID_REFRESH");
  const stored = user.refreshTokens.find((t) => t.jti === payload.jti && t.hash === hashToken(token));
  if (!stored) {
    // إعادة استخدام رمز مُبطَل: احتمال سرقة، نُنهي كل الجلسات
    user.refreshTokens = [];
    await user.save();
    throw unauthorized("انتهت الجلسة", "REFRESH_REUSED");
  }
  user.refreshTokens = user.refreshTokens.filter((t) => t.jti !== payload.jti);
  const tokens = await issueTokens(user);
  return { user: user.toPublic(), tokens };
}

export async function logout(token) {
  if (!token) return;
  try {
    const payload = verifyRefresh(token);
    await User.updateOne({ _id: payload.sub }, { $pull: { refreshTokens: { jti: payload.jti } } });
  } catch (err) {
    // رمز منتهٍ أو تالف: لا شيء يُحذف، والكوكي يُمسح على أي حال
  }
}
