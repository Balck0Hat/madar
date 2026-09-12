// ألوان الفئات ومسمّيات الطبقات في مكان واحد للقائمة والملف الشخصي
import { C } from "../../../shared/constants/theme";

export const ERAS = ["القديم", "الوسيط", "الحديث المبكر", "الحديث", "المعاصر"];
export const CATEGORIES = ["دين وفلسفة", "علوم وطب", "تقنية واقتصاد", "قادة وسياسة", "أدب ولغة", "فنون", "استكشاف وجغرافيا"];

export const CATEGORY_COLOR = {
  "دين وفلسفة": "#C9A227", "علوم وطب": "#3FA0D8", "تقنية واقتصاد": "#5FB37A",
  "قادة وسياسة": "#D86A5A", "أدب ولغة": "#B07CD8", "فنون": "#E08FB0", "استكشاف وجغرافيا": "#4FC1B8",
};
export const colorOf = (category) => CATEGORY_COLOR[category] || C.gold;

export const TIER_LABEL = { prophet: "نبي", 1: "غيّر مسار البشرية", 2: "غيّر حضارته أو مجاله" };

// السنة كما كُتبت: السالبة قبل الميلاد، و~ تقريبية
export const yearLabel = (y) => {
  if (!y) return "";
  const approx = String(y).startsWith("~");
  const n = Number(String(y).replace("~", ""));
  if (Number.isNaN(n)) return String(y);
  return `${approx ? "نحو " : ""}${Math.abs(n)}${n < 0 ? " ق.م" : ""}`;
};
export const lifeLabel = (f) => [yearLabel(f.born), yearLabel(f.died)].filter(Boolean).join(" – ") || "";
