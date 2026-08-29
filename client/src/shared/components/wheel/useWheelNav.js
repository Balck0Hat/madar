import { useMemo, useRef, useState } from "react";
import { DOMAINS } from "../../data/domains";
import { cueId } from "./wheelUnits";

const N = DOMAINS.length;
const clamp = (v, hi) => Math.max(0, Math.min(hi, v));
const sectorCue = (di, r) => ({ kind: "sector", di, r });
const unitCue = (u) => ({ kind: "unit", id: u.id, di: u.di, r: u.r });

// RTL: اليسار هو «التالي» مع عقارب الساعة لأن di يتزايد مع الزاوية،
// والأعلى يخرج إلى مدار أوسع.
const STEP = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };

// تنقّل لوحة المفاتيح بمؤشّر افتراضي (aria-activedescendant): عنصر واحد فقط في
// ترتيب Tab هو الحاوية. البديل — roving tabindex — كان سيبدّل خاصية على ٢٧٠
// عنصراً عند كل حركة فيُبطل تذكّر الطبقة ويُعيد بناءها في كل ضغطة.
export function useWheelNav({ units, prefix, enabled, onSelect, onSelectUnit }) {
  const [cue, setCue] = useState(null);
  const live = useRef(null);
  live.current = { units, onSelect, onSelectUnit, cue };

  const props = useMemo(() => {
    const openUnits = (di, r) => live.current.units.filter((u) => u.di === di && u.r === r && !u.locked);
    const onKeyDown = (e) => {
      const { cue: at, onSelect: pick, onSelectUnit: pickUnit } = live.current;
      const c = at || sectorCue(0, 0);
      const go = (next) => { e.preventDefault(); setCue(next); };
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (c.kind === "unit") { if (pickUnit) pickUnit(c.id); }
        else if (pick) pick(DOMAINS[c.di].id, c.r, c.di);
        return;
      }
      if (e.key === "Escape") { if (c.kind === "unit") go(sectorCue(c.di, c.r)); return; }
      if (e.key === "Tab") {
        const list = openUnits(c.di, c.r);
        if (c.kind === "sector") { if (!e.shiftKey && list.length) go(unitCue(list[0])); return; }
        const i = list.findIndex((u) => u.id === c.id);
        const to = list[i + (e.shiftKey ? -1 : 1)];
        if (to) go(unitCue(to));
        else if (e.shiftKey) go(sectorCue(c.di, c.r));
        return; // بعد آخر وحدة نترك Tab يخرج من العجلة بدل حبس التركيز
      }
      const step = STEP[e.key];
      if (!step) return;
      if (c.kind === "unit") {
        const list = openUnits(c.di, c.r);
        const to = step[0] ? list[list.findIndex((u) => u.id === c.id) + step[0]] : null;
        go(to || sectorCue(c.di, c.r)); // السهم الرأسي يرجع من الوحدات إلى قطاعها
        return;
      }
      go(sectorCue((c.di + step[0] + N) % N, clamp(c.r + step[1], 2)));
    };
    return {
      tabIndex: 0,
      role: "application",
      "aria-label": "عجلة المعرفة: الأسهم للتنقل بين القطاعات، Tab للدخول إلى وحداتها، Enter للفتح",
      onKeyDown,
      onFocus: () => setCue((c) => c || sectorCue(0, 0)),
      onBlur: () => setCue(null),
      style: { outline: "none" }, // حلقة التركيز مرسومة داخل SVG (انظر FocusRing)
    };
  }, []);

  if (!enabled) return { cue: null, props: null };
  return { cue, props: { ...props, "aria-activedescendant": cue ? cueId(prefix, cue) : undefined } };
}
