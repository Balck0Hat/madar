import { verifyAccess } from "../utils/tokens.js";
import { ACCESS_COOKIE } from "../utils/cookies.js";
import { unauthorized } from "../utils/AppError.js";

// يتحقق من كوكي الوصول ويعلّق معرّف المستخدم على الطلب
export function requireAuth(req, res, next) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) return next(unauthorized());
  try {
    const payload = verifyAccess(token);
    if (payload.type !== "access") return next(unauthorized());
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    next(unauthorized(err.name === "TokenExpiredError" ? "انتهت الجلسة" : "جلسة غير صالحة", "INVALID_TOKEN"));
  }
}
