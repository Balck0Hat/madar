// يفكّك الرقم البطل («40,000» · «90%» · «100 ألف» · «7.8 كم/ث» · «1847») إلى
// سابقة وقيمة ولاحقة، ليُعدّ صعوداً ثم يُعاد تركيبه كما كُتب. ما لا يُفهم
// بأمان (أبعاد «77×53»، مدى «80–95%») يُترك ثابتاً: رقم يومض بغير ما دُقّق أسوأ من رقم لا يتحرك.
const SHAPE = /^([^\d]*)(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)(.*)$/;

export function parseHero(num) {
  const m = SHAPE.exec(String(num ?? "").trim());
  if (!m) return null;
  const [, prefix, raw, suffix] = m;
  if (/\d/.test(suffix)) return null; // رقم ثانٍ في اللاحقة: مدى أو أبعاد، لا يُعدّ
  const value = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(value)) return null;
  const decimals = (raw.split(".")[1] || "").length;
  const year = /^\d{4}$/.test(raw) && value >= 1000 && value <= 2100;
  return { prefix, value, suffix, decimals, grouped: raw.includes(","), year };
}

export function formatHero(parsed, current) {
  const { prefix, suffix, decimals, grouped } = parsed;
  const fixed = current.toFixed(decimals);
  const [int, frac] = fixed.split(".");
  const body = grouped ? int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : int;
  return `${prefix}${frac ? `${body}.${frac}` : body}${suffix}`;
}
