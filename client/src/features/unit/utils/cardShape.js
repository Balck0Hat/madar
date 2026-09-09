// شكل البطاقة يُستنتج من نصّها لا يُكتب لها: كل بطاقة كانت رسمة + عنوان + نثر
// أربع عشرة مرة. هنا نقرأ العنوان والأرقام ونعطي كلاً منها ما يليق به،
// والنصّ نفسه لا يُمسّ — ما يُعرض مقتطع منه حرفاً بحرف.

const QUESTION_START = /^(لماذا|كيف|ماذا|هل|متى|أين|من|ما)\s/;

// تعريف: «القلب: مضخة بحجم قبضتك» — المصطلح كبيراً والشرح تحته.
// سؤال: ينتهي بعلامة استفهام أو يبدأ بأداتها.
export function headingShape(h = "") {
  const t = String(h).trim();
  const colon = t.indexOf(":");
  if (colon > 1 && colon < t.length - 2) {
    const term = t.slice(0, colon).trim(), gloss = t.slice(colon + 1).trim();
    // مصطلح من كلمة إلى ثلاث: أطول من ذلك ليس تعريفاً بل جملة فيها نقطتان
    if (term.split(/\s+/).length <= 3 && !/[؟?]/.test(term)) return { kind: "definition", term, gloss };
  }
  if (/[؟?]\s*$/.test(t) || QUESTION_START.test(t)) return { kind: "question" };
  return { kind: "plain" };
}

const STOP = new Set(["من", "في", "إلى", "على", "عن", "و", "أو", "ثم", "أي", "نحو", "بين", "حتى", "بعد", "قبل", "مع", "كل", "إن", "أن", "لا", "ما", "هو", "هي", "ذلك", "هذا", "هذه", "التي", "الذي"]);
const NUM = /(?<![\d.,])(\d{1,3}(?:[,٬]\d{3})+|\d+(?:\.\d+)?)\s*(%|٪|ألف|آلاف|مليون|ملايين|مليار|مليارات)?\s+([^\s\d،.:؛()«»]+)(?:\s+([^\s\d،.:؛()«»]+))?/g;
const isYear = (v) => /^\d{4}$/.test(v) && +v >= 1000 && +v <= 2100;

// بلاطات الأرقام: البطاقة التي تحمل ثلاثة أرقام فأكثر تُعرض أرقامها كبيرة فوق
// النثر، وكل بلاطة رقم كما ورد تليه الكلمة التي تليه. السنوات ليست
// إحصاءات فتُستثنى، والرقم الذي يليه حرف جرّ وحده لا يصلح بلاطة.
export function statTiles(card, max = 3) {
  const text = `${card?.p || ""} ${(card?.points || []).join(" ")} ${card?.after || ""}`;
  const seen = new Set();
  const tiles = [];
  for (const m of text.matchAll(NUM)) {
    const [, raw, scale, w1] = m;
    if (isYear(raw) || seen.has(raw)) continue;
    // الكلمة التي تلي الرقم هي التسمية؛ إن كانت أداة فلا تسمية ولا بلاطة
    if (!w1 || STOP.has(w1) || w1.length < 3) continue;
    seen.add(raw);
    tiles.push({ v: scale && !/%|٪/.test(scale) ? `${raw} ${scale}` : scale ? `${raw}٪` : raw, l: w1 });
    if (tiles.length === max) break;
  }
  return tiles.length >= 3 ? tiles : [];
}
