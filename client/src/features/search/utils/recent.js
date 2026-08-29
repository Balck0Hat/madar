const KEY = "madar.recentSearches";
const MAX = 5;

// آخر عمليات البحث تُحفظ محلياً فقط؛ localStorage قد يكون محجوباً (وضع خاص)
// لذا كل وصول ملفوف بـ try/catch ويعود بقائمة فارغة بدل أن يُسقط الشاشة.
export function readRecent() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((s) => typeof s === "string" && s.trim()).slice(0, MAX) : [];
  } catch (err) {
    return [];
  }
}

export function pushRecent(query) {
  const q = String(query || "").trim();
  const next = q ? [q, ...readRecent().filter((s) => s !== q)].slice(0, MAX) : readRecent();
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch (err) {
    // التخزين ممتلئ أو محجوب؛ نكتفي بالقائمة في الذاكرة
  }
  return next;
}

export function clearRecent() {
  try {
    localStorage.removeItem(KEY);
  } catch (err) {
    // لا شيء يُفعل
  }
  return [];
}
