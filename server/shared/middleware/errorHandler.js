import { env } from "../config/env.js";

const fail = (res, status, message, code, details) =>
  res.status(status).json({ success: false, error: { message, code, ...(details ? { details } : {}) } });

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.isOperational) return fail(res, err.statusCode, err.message, err.code, err.details);
  if (err.name === "ZodError") return fail(res, 400, "بيانات غير صالحة", "VALIDATION_ERROR", err.flatten().fieldErrors);
  if (err.name === "ValidationError") return fail(res, 400, "بيانات غير صالحة", "VALIDATION_ERROR");
  if (err.name === "CastError") return fail(res, 400, "معرّف غير صالح", "BAD_ID");
  if (err.code === 11000) return fail(res, 409, "القيمة مستخدمة من قبل", "DUPLICATE");
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") return fail(res, 401, "جلسة غير صالحة", "INVALID_TOKEN");
  if (err.type === "entity.too.large") return fail(res, 413, "الطلب كبير جداً", "PAYLOAD_TOO_LARGE");
  if (err.type === "entity.parse.failed") return fail(res, 400, "JSON غير صالح", "BAD_JSON");
  if (!env.isTest) console.error("[unhandled]", err);
  return fail(res, 500, "خطأ داخلي في الخادم", "INTERNAL_ERROR");
}

export function notFoundHandler(req, res) {
  fail(res, 404, "المسار غير موجود", "NOT_FOUND");
}
