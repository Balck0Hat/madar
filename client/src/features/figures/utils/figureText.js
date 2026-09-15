// ما يُشتقّ من الملف والقائمة بلا محتوى جديد: من ذُكر في نصّه، ومن عاصره،
// وكم مضى عليه، وفي أي حقبة يقع. كله من الأسماء والسنوات الموجودة أصلاً.

const THIS_YEAR = new Date().getFullYear();
const LIFE = 70; // عمر افتراضي لمن لا سنة وفاة له

export const yearNum = (y) => {
  if (!y) return null;
  const n = Number(String(y).replace("~", ""));
  return Number.isNaN(n) ? null : n;
};

export const span = (f) => {
  const b = yearNum(f.born);
  if (b === null) return null;
  return { from: b, to: yearNum(f.died) ?? b + LIFE };
};

// مفتاح البحث عن الاسم في النصوص: أول كلمة، أو كلمتان إن كانت الأولى قصيرة («لاو تسي»)
export const nameKey = (name) => {
  const w = String(name || "").trim().split(/\s+/);
  return w[0]?.length >= 4 ? w[0] : w.slice(0, 2).join(" ");
};

const KUNYA = /(?:أبو|أبي|أبا|أم)\s+$/; // «أبو موسى» ليس موسى

// كم مرة ذُكر كل من في القائمة داخل نصّ هذا الملف
export function mentions(figure, list) {
  const text = [figure.quick, ...(figure.story || []).map((s) => s.p)].join(" ");
  return list
    .filter((o) => o.figureId !== figure.figureId)
    .map((o) => {
      const key = nameKey(o.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(?<![\\p{L}])(?:و|ف|ب|ل|ك|وب|ول)?${key}(?![\\p{L}])`, "gu");
      let n = 0;
      for (const m of text.matchAll(re)) if (!KUNYA.test(text.slice(Math.max(0, m.index - 6), m.index))) n++;
      return { figure: o, count: n };
    })
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
}

export const related = (figure, list, max = 3) => mentions(figure, list).slice(0, max).map((x) => x.figure);

// من تقاطع عمره مع عمر هذه الشخصية
export function contemporaries(figure, list) {
  const me = span(figure);
  if (!me) return [];
  return list
    .filter((o) => o.figureId !== figure.figureId)
    .filter((o) => { const s = span(o); return s && s.from <= me.to && s.to >= me.from; })
    .sort((a, b) => yearNum(a.born) - yearNum(b.born));
}

export const nextOf = (figure, list) => {
  const i = list.findIndex((o) => o.figureId === figure.figureId);
  return i >= 0 ? list[i + 1] || null : null;
};

// «عاش قبل نحو 2,600 سنة»: أقرب خمسين، لأن الدقة هنا وهم
export function agoLabel(f) {
  const b = yearNum(f.born);
  if (b === null) return "";
  const ago = Math.round((THIS_YEAR - b) / 50) * 50;
  return `عاش قبل نحو ${ago.toLocaleString("en-US")} سنة`;
}

const CENT = ["", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون", "الحادي والعشرون"];
const MILL = ["", "الأولى", "الثانية", "الثالثة", "الرابعة"];

// الحقبة كما يقولها الناس: الأنبياء معاً، وقبل الألف الأولى ق.م بالألفيات، وبعدها بالقرون
export function periodLabel(f) {
  if (f.tier === "prophet") return "الأنبياء";
  const b = yearNum(f.born);
  if (b === null) return "غير مؤرَّخ";
  if (b <= -1000) return `الألفية ${MILL[Math.min(4, Math.ceil(-b / 1000))]} قبل الميلاد`;
  if (b < 0) return `القرن ${CENT[Math.ceil(-b / 100)]} قبل الميلاد`;
  return `القرن ${CENT[Math.min(21, Math.floor((b - 1) / 100) + 1)]} الميلادي`;
}

export function groupByPeriod(list) {
  const out = [];
  for (const f of list) {
    const label = periodLabel(f);
    const last = out[out.length - 1];
    if (last && last.label === label) last.items.push(f);
    else out.push({ label, items: [f] });
  }
  return out;
}
