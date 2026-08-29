// موضع القراءة المحفوظ: خريطة { unitId: رقم البطاقة }، يمسحها الخادم عند اجتياز الوحدة.
// السبب: الشاشة الأولى يجب أن تحمل فعلاً واحداً؛ فإن كان المتعلّم قد توقّف في منتصف
// وحدة، متابعة تلك الوحدة أصدق من دعوته إلى بداية جديدة.

const started = (resume, id) => Number(resume?.[id]) > 0;

// نفضّل الوحدة الموصى بها إن كانت هي نفسها المتوقّفة، وإلا أول وحدة غير مكتملة
// عليها موضع محفوظ. لا طوابع زمنية في البيانات، فالترتيب هو ترتيب المفاتيح.
export function resumeUnit(resume, progress = {}, next = null) {
  if (!resume || typeof resume !== "object") return null;
  if (next && started(resume, next)) return next;
  const ids = Object.keys(resume);
  return ids.find((id) => started(resume, id) && !progress[id]) || null;
}
