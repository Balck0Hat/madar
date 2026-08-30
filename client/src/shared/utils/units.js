import { DOMAINS } from "../data/domains";
import { CENTER, RING_MIN } from "../data/curriculum";
import { C } from "../constants/theme";

// معرّف الوحدة: domain-ring-index (أرقام تبدأ من 1) أو center-n
export const uid = (d, r, i) => `${d}-${r + 1}-${i + 1}`;

export function parseId(id) {
  const [d, r, i] = id.split("-");
  if (d === "center") return { center: true, i: +r - 1 };
  return { center: false, d, r: +r - 1, i: +i - 1, di: DOMAINS.findIndex((x) => x.id === d) };
}

export function unitInfo(id) {
  const p = parseId(id);
  if (p.center) return { id, title: CENTER[p.i], ring: 0, color: C.gold, domainName: "المركز", domain: null, minutes: 30, step: p.i + 1, of: CENTER.length };
  const dom = DOMAINS[p.di];
  return { id, title: dom.rings[p.r][p.i], ring: p.r, color: dom.color, domainName: dom.name, domain: dom, minutes: RING_MIN[p.r] };
}

export const isCenter = (id) => id.startsWith("center");
