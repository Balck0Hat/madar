// خطأ تشغيلي متوقَّع: يُعرض للمستخدم بالرسالة والكود
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const badRequest = (msg, code = "BAD_REQUEST") => new AppError(msg, 400, code);
export const unauthorized = (msg = "يلزم تسجيل الدخول", code = "UNAUTHORIZED") => new AppError(msg, 401, code);
export const forbidden = (msg = "غير مسموح", code = "FORBIDDEN") => new AppError(msg, 403, code);
export const notFound = (msg = "غير موجود", code = "NOT_FOUND") => new AppError(msg, 404, code);
export const conflict = (msg, code = "CONFLICT") => new AppError(msg, 409, code);
