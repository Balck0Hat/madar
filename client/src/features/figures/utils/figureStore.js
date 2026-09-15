// ذاكرة الجهاز لقسم الشخصيات: ما قُرئ، وآخر قسم وصل إليه القارئ في كل قصة.
// راحة لا سجلّ: لا يُرسل للخادم ولا يُحتسب تقدّماً، فيكفيه التخزين المحلي.

const KEY = "madar.figures";

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } // خاص أو معطّل: نبدأ فارغين
};
const save = (data) => {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* الحصة ممتلئة أو التخزين ممنوع: تضيع الراحة لا الميزة */ }
};

export const readSet = () => new Set(Object.keys(load().read || {}));
export const isRead = (figureId) => Boolean(load().read?.[figureId]);
export const markRead = (figureId) => { const d = load(); d.read = { ...(d.read || {}), [figureId]: Date.now() }; save(d); };

export const getPage = (figureId) => Number(load().page?.[figureId]) || 0;
export const setPage = (figureId, page) => { const d = load(); d.page = { ...(d.page || {}), [figureId]: page }; save(d); };
