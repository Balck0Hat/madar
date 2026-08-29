import { get } from "../../../shared/utils/api";

// مسارات التحليلات للمشرف؛ نداءات الشبكة لا تسكن المكوّنات
export const getFunnel = (days = 90) => get(`/analytics/funnel?days=${days}`);
export const getHardQuestions = (min = 5) => get(`/analytics/hard-questions?min=${min}`);
