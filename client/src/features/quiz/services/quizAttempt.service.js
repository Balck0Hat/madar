import { post, patch } from "../../../shared/utils/api";

// يبدأ محاولة أو يستأنف المفتوحة: الخادم هو من يحفظ الأسئلة، فإعادة التحميل لا تُعيد السحب
export const startAttempt = (unitId, n = 10) => post(`/quiz-attempts/${unitId}/start?n=${n}`);

// تُحفظ كل إجابة فور تسجيلها كي لا يضيع تقدّم من غادر عند السؤال الثامن
export const saveAnswer = (unitId, entry) => patch(`/quiz-attempts/${unitId}`, entry);
