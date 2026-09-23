// مطابقة التلاوة بالنصّ: تطبيع يُسقط التشكيل وعلامات الوقف والرسم العثماني
// الخاص، ويوحّد الألف والهمزات والتاء المربوطة، ثم محاذاة كلمات ما سُمع مع
// كلمات الآية المتوقّعة. النسخة نفسها في العميل (shared/utils/arabic.js).

const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ࣓-ࣿ]/g;

export function normalize(s) {
  return String(s || "")
    .replace(/\u0670/g, "ا") // الألف الخنجرية في الرسم العثماني (مَٰلِكِ، صِرَٰطَ، ٱلرَّحۡمَٰنِ) ألف
    .replace(MARKS, "")
    .replace(/[ٱأإآ]/g, "ا").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ء/g, "").replace(/ة/g, "ه").replace(/ى/g, "ي")
    .replace(/[^ء-ي\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const words = (s) => (normalize(s) ? normalize(s).split(" ") : []);

// كلمتان متقاربتان تُعدّان الكلمة نفسها: إبدال حرف واحد في كلمة من أربعة أحرف
// فأكثر (النموذج يخطئ في حرف)، أو حرف مدّ زائد/ناقص في كلمة من ثلاثة فأكثر
// (مالك/ملك، الرحمان/الرحمن). أما «اله» و«الا» و«الى» فكلمات مختلفة.
const LONG = "اوي";
function close(a, b) {
  if (a === b) return true;
  const d = a.length - b.length;
  if (Math.abs(d) > 1 || Math.min(a.length, b.length) < 3) return false;
  if (d === 0) {
    if (a.length < 4) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && ++diff > 1) return false;
    return true;
  }
  const [long, short] = d > 0 ? [a, b] : [b, a];
  for (let i = 1; i < long.length; i++) { // لا في أول الكلمة: «واياك» غير «اياك»
    if (LONG.includes(long[i]) && long.slice(0, i) + long.slice(i + 1) === short) return true;
  }
  return false;
}

/**
 * يحاذي كلمات الآية (expected) مع ما سُمع (heard) بأطول تسلسل مشترك، ويعيد
 * لكل كلمة متوقّعة حالتها: "ok" سُمعت، "miss" تُخطّيت أو خُطئت، "pending" لم يصل إليها بعد.
 * cursor: أول كلمة لم تُسمع بعد آخر كلمة صحيحة. done: كل الكلمات سُمعت.
 */
export function align(expected, heard) {
  const E = Array.isArray(expected) ? expected : words(expected);
  const H = Array.isArray(heard) ? heard : words(heard);
  const n = E.length, m = H.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = close(E[i], H[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const status = new Array(n).fill("pending");
  let i = 0, j = 0, last = -1, used = -1; // used: آخر كلمة مسموعة استُهلكت في المطابقة
  while (i < n && j < m) {
    if (close(E[i], H[j])) { status[i] = "ok"; last = i; used = j; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { status[i] = "miss"; i++; }
    else j++;
  }
  // ما بعد آخر كلمة صحيحة لم يُقرأ بعد، لا خطأ فيه
  for (let k = last + 1; k < n; k++) status[k] = "pending";
  const cursor = last + 1;
  return { status, cursor, used, done: cursor >= n && n > 0, heard: H.length, ok: status.filter((s) => s === "ok").length, miss: status.filter((s) => s === "miss").length };
}
