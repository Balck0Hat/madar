// يمرّر أخطاء الدوال غير المتزامنة إلى معالج الأخطاء المركزي
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
