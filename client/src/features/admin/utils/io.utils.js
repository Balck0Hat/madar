// أدوات الاستيراد والتصدير والنسخ — دوال خالصة قابلة للاختبار وحدها

// نقبل ثلاثة أشكال: مصفوفة وحدات، أو {units:[...]} كما يعيده التصدير الكامل،
// أو وحدة واحدة — لأن المشرف قد يلصق أياً منها دون أن ينتبه للفرق
export function parseUnitsPayload(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("الصق محتوى JSON أو ارفع ملفاً أولاً");
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("JSON غير صالح: تحقّق من الأقواس والفواصل");
  }
  const units = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.units) ? parsed.units : parsed && typeof parsed === "object" ? [parsed] : null;
  if (!units?.length) throw new Error("لم نجد وحدات في هذا الملف");
  if (units.length > 100) throw new Error(`الحد 100 وحدة في المرة الواحدة (وجدنا ${units.length})`);
  return units;
}

export const countsOf = (unit) => ({ cards: unit?.cards?.length || 0, questions: unit?.questions?.length || 0 });

// علامة الطرح العربية (U+2212) لا الشرطة، حتى لا تُقرأ كواصلة
export const formatDelta = (n) => (n === 0 ? "" : n > 0 ? `+${n}` : `−${Math.abs(n)}`);

// ماذا سيتغيّر لو استُعيدت هذه النسخة: الفرق بين عدّاداتها وعدّادات الحالة الحالية
export const versionDelta = (version, current) => ({
  cards: (version?.cards || 0) - (current?.cards || 0),
  questions: (version?.questions || 0) - (current?.questions || 0),
});

export const versionFileName = (unitId, version) => `${unitId}-v${version}.json`;

export function downloadJson(filename, data) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // نؤجل التحرير لأن بعض المتصفحات تقرأ الرابط بعد النقر بلحظة
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
