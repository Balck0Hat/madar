const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

// تحويل الأرقام اللاتينية إلى عربية-هندية
export const toAr = (v) => String(v).replace(/\d/g, (d) => AR_DIGITS[d]);

// توحيد الإجابات النصية للمقارنة: تشذيب، حروف صغيرة، أرقام لاتينية
export const norm = (s) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[٠-٩]/g, (c) => AR_DIGITS.indexOf(c));

// عشوائية حتمية (لتوزيع النجوم والقصاصات بثبات بين التصييرات)
export const hash = (n) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export const vibrate = (pattern) => {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch (err) {
    // الاهتزاز غير مدعوم في هذا المتصفح؛ لا شيء يُفعل
  }
};

export const todayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
