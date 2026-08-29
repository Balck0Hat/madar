import { put } from "../../../shared/utils/api";

// حفظ موضع القراءة داخل الوحدة: PUT /progress/units/:unitId/resume ← { card }
// نبتلع الخطأ عمداً (وحده هنا): الحفظ ميزة مساعدة تعمل في الخلفية أثناء القراءة،
// وقد لا يدعمها الخادم بعد (404)، فلا يصح أن تقطع الدرس أو تُظهر تنبيه خطأ للقارئ.
export const saveResume = async (unitId, card) => {
  if (!unitId || !Number.isInteger(card)) return null;
  try {
    return await put(`/progress/units/${unitId}/resume`, { card });
  } catch {
    return null;
  }
};
