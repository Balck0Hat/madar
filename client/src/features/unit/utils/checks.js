// يربط كل سؤال مغلق في بنك الوحدة بالبطاقة التي تجيب عنه، ليُعرض بعدها
// «سؤال سريع» اختياريّ. الأسئلة موجودة أصلاً على الجهاز بإجاباتها وشرحها،
// فلا محتوى جديد ولا نداء للخادم — فقط مطابقة كلمات بين السؤال والبطاقات.
//
// المطابقة بتداخل الكلمات لا بشيء أذكى: تكفي لأن كل سؤال كُتب عن بطاقة بعينها
// بمفرداتها. وحين لا يحسم التداخل (فارق ضئيل بين بطاقتين) لا نعرض شيئاً:
// سؤال في غير موضعه، عن بطاقة لم تُقرأ بعد، أسوأ من لا سؤال.

const MIN_SCORE = 3; // أقلّ تداخل يُعتدّ به
const MIN_MARGIN = 1; // الفارق عن ثاني أفضل بطاقة

const DIACRITICS = /[ً-ْٰـ]/g;
const PUNCT = /[^\p{L}\p{N}\s]/gu;
const PREFIX = /^(?:وال|بال|فال|كال|لل|ال|و|ف|ب|ل|ك)(?=.{3,})/;

// كلمات مقارنة: بلا تشكيل ولا ترقيم ولا سوابق، وبطول ثلاثة أحرف فأكثر
export function tokens(text) {
  return String(text || "")
    .replace(DIACRITICS, "")
    .replace(PUNCT, " ")
    .split(/\s+/)
    .map((w) => w.replace(PREFIX, ""))
    .filter((w) => w.length >= 3);
}

const closed = (q) => (q.t === "mcq" || q.t === "tf") && q.a !== undefined && q.q;
const correctText = (q) => (q.t === "mcq" ? q.opts?.[q.a] || "" : "");

// نصّ السؤال + إجابته الصحيحة + شرحه هو ما يُقارَن بالبطاقة
const questionBag = (q) => new Set(tokens(`${q.q} ${correctText(q)} ${q.why || ""}`));
const cardBag = (c) => new Set(tokens(`${c.h} ${c.p} ${(c.points || []).join(" ")} ${c.after || ""}`));

function overlap(a, b) {
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return n;
}

/**
 * يعيد مصفوفة بطول البطاقات: في كل موضع السؤال المختار لتلك البطاقة أو null.
 * لكل بطاقة سؤال واحد على الأكثر، ولكل سؤال بطاقة واحدة.
 */
export function mapChecks(cards = [], questions = []) {
  const bags = cards.map(cardBag);
  const candidates = [];
  for (const q of questions.filter(closed)) {
    const bag = questionBag(q);
    const scores = bags.map((b) => overlap(bag, b));
    const best = scores.reduce((m, s, i) => (s > scores[m] ? i : m), 0);
    const second = Math.max(...scores.filter((_, i) => i !== best), 0);
    if (scores[best] >= MIN_SCORE && scores[best] - second >= MIN_MARGIN) candidates.push({ card: best, q, score: scores[best] });
  }
  // الأعلى تداخلاً أولاً، فتأخذ كل بطاقة أصدق سؤال لها
  candidates.sort((x, y) => y.score - x.score);
  const out = cards.map(() => null);
  for (const c of candidates) if (!out[c.card]) out[c.card] = c.q;
  return out;
}
