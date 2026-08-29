import { DOMAIN_IDS, CENTER_COUNT, RINGS, UNITS_PER_RING } from "../data/curriculum.js";

// معرّف الوحدة: domain-ring-index (من 1) أو center-n
export function parseUnitId(id) {
  const parts = String(id).split("-");
  if (parts[0] === "center") {
    const i = Number(parts[1]);
    if (parts.length !== 2 || !Number.isInteger(i) || i < 1 || i > CENTER_COUNT) return null;
    return { center: true, ring: 0, domain: null };
  }
  const [d, r, i] = [parts[0], Number(parts[1]), Number(parts[2])];
  if (parts.length !== 3 || !DOMAIN_IDS.includes(d)) return null;
  if (!Number.isInteger(r) || r < 1 || r > RINGS || !Number.isInteger(i) || i < 1 || i > UNITS_PER_RING) return null;
  return { center: false, ring: r - 1, domain: d };
}

export const isValidUnitId = (id) => parseUnitId(id) !== null;
export const uid = (d, ring0, i0) => `${d}-${ring0 + 1}-${i0 + 1}`;
