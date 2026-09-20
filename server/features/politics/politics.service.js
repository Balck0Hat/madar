import { COUNTRIES, TITLE_FAMILIES, SYSTEMS } from "../../shared/data/politics/index.js";
import { notFound } from "../../shared/utils/AppError.js";

// بطاقة الدولة في القائمة: كل شيء إلا النصوص الطويلة
const card = ({ quick, story, sources, check, ...rest }) => rest;

const byId = new Map(COUNTRIES.map((c) => [c.countryId, c]));

export const listCountries = () => COUNTRIES.map(card);

export function getCountry(countryId) {
  const c = byId.get(countryId);
  if (!c) throw notFound("الدولة غير متاحة", "COUNTRY_NOT_FOUND");
  return c;
}

export const listTitles = () => TITLE_FAMILIES;

// أنواع الحكم مع عدد دولنا في كل نوع، وتاريخ آخر تحقق من أسماء الحكّام
export function overview() {
  const counts = COUNTRIES.reduce((m, c) => m.set(c.government.type, (m.get(c.government.type) || 0) + 1), new Map());
  const asOf = COUNTRIES.map((c) => c.asOf).filter(Boolean).sort().pop() || null;
  return {
    systems: SYSTEMS.map((s) => ({ ...s, ours: counts.get(s.name) || 0 })),
    counts: { countries: COUNTRIES.length, titles: TITLE_FAMILIES.reduce((n, f) => n + f.titles.length, 0), families: TITLE_FAMILIES.length },
    asOf,
  };
}
