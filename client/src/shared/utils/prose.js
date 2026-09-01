// متن الدرس يصل فقرةً واحدة: 2985 بطاقة، متوسطها 107 كلمات، وليس في واحدة
// منها فاصل سطر. مئة كلمة في كتلة واحدة على شاشة هاتف كتلة صمّاء لا يجد فيها
// النظر مدخلاً ولا مكاناً يستريح عنده.
//
// التقسيم هنا عرضٌ لا تحرير: النص يُقطَّع عند حدود الجمل ثم يُعاد تجميعه في
// فقرات، ومجموع الفقرات يساوي الأصل حرفاً بحرف (يحرسه اختبار). فلا تُمسّ مادة
// دُقّقت، ولا يُطلب من أحد إعادة كتابة ألفي بطاقة.

const TARGET = 48; // الطول المريح لفقرة عربية على الهاتف
const MIN = 22; // أقصر من هذا يبدو سطراً شارداً لا فقرة

// أدوات الربط التي يبدأ عندها المعنى منعطفاً جديداً: القطع قبلها أصدق من
// القطع عند أقرب جملة إلى منتصف العدّ.
const TURNS = [
  "أولاً", "ثانياً", "ثالثاً", "رابعاً", "خامساً",
  "أما", "أمّا", "غير أن", "غير أنّ", "بيد أن", "بيد أنّ", "على أن", "إلا أن", "إلّا أنّ",
  "لكن", "لكنّ", "ولكن", "ثم", "ثمّ",
  "والنتيجة", "والدرس", "والفكرة", "والخلاصة", "والأثر", "والسبب", "والمعنى", "والفرق",
  "وفي المقابل", "في المقابل", "وفي الاتجاه", "والاعتراض", "والنقد", "وهنا", "ولهذا", "ولذلك",
];

const countWords = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const startsTurn = (s) => TURNS.some((t) => s.startsWith(`${t} `) || s.startsWith(`${t}،`) || s.startsWith(`${t}:`));

// حدود الجمل كمواضع في النصّ الأصلي لا كقطع منفصلة: التظليل يُطابَق على
// النصّ الكامل ثم يُوزَّع على الفقرات، فلا يضيع تظليل يعبر حدّ فقرة.
// القطع بعد نقطة أو استفهام أو تعجّب يتبعها فراغ؛ والأرقام العشرية (1.5)
// لا فراغ بعد نقطتها فلا تنقسم.
function sentenceRanges(src) {
  const out = [];
  let at = 0;
  for (const m of src.matchAll(/(?<=[.؟!])\s+/g)) {
    out.push({ start: at, end: m.index });
    at = m.index + m[0].length;
  }
  if (at < src.length) out.push({ start: at, end: src.length });
  return out.filter((r) => src.slice(r.start, r.end).trim());
}

/** مواضع الفقرات في النصّ الأصلي: [{ start, end }] */
export function paragraphRanges(text, { target = TARGET, min = MIN } = {}) {
  const src = String(text || "");
  const trimmed = src.trim();
  if (!trimmed) return [];
  const whole = [{ start: src.indexOf(trimmed), end: src.indexOf(trimmed) + trimmed.length }];

  const parts = sentenceRanges(src);
  if (parts.length < 2 || countWords(trimmed) < target + min) return whole;

  const words = parts.map((r) => countWords(src.slice(r.start, r.end)));
  const out = [];
  let start = parts[0].start;
  let count = 0;
  for (let i = 0; i < parts.length; i++) {
    count += words[i];
    if (i === parts.length - 1) break;
    const restWords = words.slice(i + 1).reduce((sum, w) => sum + w, 0);
    // نقطع متى بلغت الفقرة طولها، أو متى بدأ ما بعدها منعطفاً وكانت كافية،
    // وبشرط أن يبقى للباقي ما يكفي ليكون فقرة لا بقيّة.
    const enough = count >= min && restWords >= min;
    const turn = startsTurn(src.slice(parts[i + 1].start, parts[i + 1].end)) && count >= target * 0.6;
    if (enough && (count >= target || turn)) {
      out.push({ start, end: parts[i].end });
      start = parts[i + 1].start;
      count = 0;
    }
  }
  out.push({ start, end: parts[parts.length - 1].end });
  return out;
}

/** الفقرات نصوصاً. وصلها بفراغ يساوي الأصل بعد توحيد الفراغات. */
export const paragraphs = (text, opts) =>
  paragraphRanges(text, opts).map((r) => String(text).slice(r.start, r.end).trim());
