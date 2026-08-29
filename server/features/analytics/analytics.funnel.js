// حساب القمع دوالّ نقية: تأخذ صفاً لكل (قارئ، وحدة) وتُخرج صفاً لكل وحدة.
// فُصلت عن الخدمة كي تُختبر بلا قاعدة بيانات ولأن المعادلة هي الجزء القابل للجدل.

export function median(nums) {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

// صفحة التوقّف: البطاقة التي وقف عندها أكبر عدد ممن لم يُنهوا الوحدة.
// من أنهى الوحدة لا يُحسب: توقّفه عند آخر بطاقة نجاح لا تسرّب.
export function dropOff(readers) {
  const stopped = new Map();
  for (const r of readers) {
    if (r.finished || !r.furthest) continue;
    stopped.set(r.furthest, (stopped.get(r.furthest) || 0) + 1);
  }
  let page = null;
  let count = 0;
  for (const [p, n] of stopped) {
    // عند التعادل نختار الأبكر: التسرّب المبكر أخطر وأجدر بالانتباه
    if (n > count || (n === count && page !== null && p < page)) { page = p; count = n; }
  }
  return { page, count };
}

// من فتح الوحدة أصلاً: أي أثر (فتح، صفحة، اختبار، إنهاء) يعني قارئاً واحداً
const opened = (r) => Boolean(r.opened || r.furthest || r.quizStarted || r.finished);

function unitRow(unitId, readers) {
  const opens = readers.filter(opened).length;
  const pages = readers.map((r) => r.furthest).filter(Boolean);
  const medianPage = median(pages);
  // «بلغ المنتصف»: من وصل إلى صفحة الوسيط أو تجاوزها — رقمٌ قابل للرسم بجانب بقية المراحل
  const reached = medianPage ? pages.filter((p) => p >= medianPage).length : 0;
  const quizStarts = readers.filter((r) => r.quizStarted).length;
  const finishes = readers.filter((r) => r.finished).length;
  const drop = dropOff(readers);
  return {
    unitId,
    opens,
    medianPage,
    reached,
    quizStarts,
    finishes,
    completion: opens ? Math.round((finishes / opens) * 100) : 0,
    dropOffPage: drop.page,
    dropOffShare: opens && drop.count ? Math.round((drop.count / opens) * 100) : 0,
  };
}

// الأسوأ إتماماً أولاً، ثم الأكثر قرّاءً: هكذا يرى المشرف ما يستحق الإصلاح فوراً
export function funnelRows(readers) {
  const byUnit = new Map();
  for (const r of readers) {
    if (!byUnit.has(r.unitId)) byUnit.set(r.unitId, []);
    byUnit.get(r.unitId).push(r);
  }
  return [...byUnit]
    .map(([unitId, rs]) => unitRow(unitId, rs))
    .sort((a, b) => a.completion - b.completion || b.opens - a.opens);
}
