import { verifyAccess } from "../utils/tokens.js";
import { ACCESS_COOKIE } from "../utils/cookies.js";
import { unauthorized, forbidden } from "../utils/AppError.js";

// يتحقق من كوكي الوصول ويعلّق { id, role } على الطلب
export function requireAuth(req, res, next) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) return next(unauthorized());
  try {
    const payload = verifyAccess(token);
    if (payload.type !== "access") return next(unauthorized());
    req.user = { id: payload.sub, role: payload.role || "user" };
    next();
  } catch (err) {
    next(unauthorized(err.name === "TokenExpiredError" ? "انتهت الجلسة" : "جلسة غير صالحة", "INVALID_TOKEN"));
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.user.role !== "admin") return next(forbidden("هذه الصفحة للمشرفين فقط", "ADMIN_ONLY"));
    next();
  });
}

// يقرأ المستخدم إن وُجد دون أن يمنع الزوار
export function optionalAuth(req, res, next) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) return next();
  try {
    const payload = verifyAccess(token);
    if (payload.type === "access") req.user = { id: payload.sub, role: payload.role || "user" };
  } catch (err) {
    // رمز منتهٍ: يُعامل كزائر
  }
  next();
}
