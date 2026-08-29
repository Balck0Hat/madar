import { C } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";

// unitInfo يفترض معرّفاً صحيحاً؛ نتيجة بحث بمعرّف غريب يجب ألا تُسقط الشاشة
export function safeUnitInfo(unitId, fallbackTitle = "") {
  try {
    const info = unitInfo(unitId);
    if (!info?.title) throw new Error("no title");
    return info;
  } catch (err) {
    return { id: unitId, title: fallbackTitle || unitId, color: C.gold, domainName: "" };
  }
}

// الخادم يلفّ المطابقات بـ «...»؛ نقسم النص إلى قطع:
// الفهارس الفردية هي المطابقات (تُعرض بلون ذهبي عريض بدل إظهار العلامتين)
export function splitMatches(text) {
  return String(text || "").split(/«([^»]*)»/g);
}
