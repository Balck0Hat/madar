import { DOMAIN_IDS, UNITS_PER_RING } from "../data/curriculum.js";
import { parseUnitId, uid } from "./units.js";

// نسخة الخادم من قاعدة الفتح: القفل في الواجهة وحدها كان قابلاً للتجاوز بطلب مباشر
export function ringUnlocked(progress, domainId, ring) {
  if (ring === 0) return true;
  if (!DOMAIN_IDS.includes(domainId)) return false;
  return Array.from({ length: UNITS_PER_RING }).every((_, i) => progress[uid(domainId, ring - 1, i)]);
}

export function unitUnlocked(progress, unitId) {
  const p = parseUnitId(unitId);
  if (!p) return false;
  return p.center || ringUnlocked(progress, p.domain, p.ring);
}
