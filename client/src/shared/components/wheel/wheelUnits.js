import { DOMAINS } from "../../data/domains";
import { CENTER } from "../../data/curriculum";
import { uid } from "../../utils/units";
import { ringUnlocked } from "../../utils/progress";
import { starPos } from "./geometry";

// وصف كل وحدة على العجلة مرة واحدة: موضعها وحالتها وعنوانها.
// مصدر واحد كي ترسم الطبقة المرئية وطبقة اللمس النقطة نفسها بلا انزياح،
// والقفل يُقرأ من ringUnlocked فيصير رأسياً داخل المجال لا عاماً على الشجرة.
export function wheelUnits(progress) {
  const list = CENTER.map((title, i) => {
    const id = `center-${i + 1}`;
    const [x, y] = starPos(id);
    return { id, title, x, y, center: true, done: Boolean(progress[id]), locked: false, di: -1, r: -1, i };
  });
  DOMAINS.forEach((d, di) =>
    d.rings.forEach((titles, r) => {
      const locked = !ringUnlocked(progress, d.id, r);
      titles.forEach((title, i) => {
        const id = uid(d.id, r, i);
        const [x, y] = starPos(id);
        list.push({ id, title, x, y, center: false, done: Boolean(progress[id]), locked, di, r, i, color: d.color });
      });
    }),
  );
  return list;
}

// عدد الوحدات المكتملة في كل قطاع: مفتاح "di-r" — يُحسب مرة لكل الشارات
export function sectorDone(units) {
  const map = {};
  units.forEach((u) => {
    if (u.center || !u.done) return;
    const key = `${u.di}-${u.r}`;
    map[key] = (map[key] || 0) + 1;
  });
  return map;
}

// معرّف DOM لعنصر المؤشّر (aria-activedescendant): مشترك بين طبقة اللمس والتنقل
export const cueId = (prefix, cue) =>
  cue.kind === "unit" ? `${prefix}u-${cue.id}` : `${prefix}s-${cue.di}-${cue.r}`;

// تساوي مؤشّرين: نحتاجه كي لا يمسح مغادرةُ هدفٍ متداخل تحويمَ الهدف الذي دخلناه للتو
export const sameCue = (a, b) =>
  Boolean(a && b && a.kind === b.kind && (a.kind === "unit" ? a.id === b.id : a.di === b.di && a.r === b.r));
