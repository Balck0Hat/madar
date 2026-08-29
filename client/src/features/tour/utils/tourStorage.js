const KEY = "madar.tour.v1";

// الجولة تُعرض مرة واحدة في العمر. نضع رقم النسخة في المفتاح نفسه، فإن تغيّرت
// الجولة يوماً كفى تغيير المفتاح لعرضها من جديد دون مسّ ما حفظه المتعلّم.
// كل وصول للتخزين داخل try/catch: قد يكون محجوباً (تصفّح خاص) فلا يجوز أن يُسقط الشاشة.

export function shouldShowTour() {
  try {
    return localStorage.getItem(KEY) !== "done";
  } catch {
    // لا نستطيع التذكّر، ولا نستطيع تكرار الجولة كل زيارة: الأسلم ألا نعرضها
    return false;
  }
}

export function markTourDone() {
  try {
    localStorage.setItem(KEY, "done");
  } catch {
    // محجوب: الجولة انتهت في هذه الجلسة على الأقل
  }
}
