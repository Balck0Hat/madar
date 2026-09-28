import { Sparkles } from "lucide-react";
import { C, T, R, S, TAP } from "../../../shared/constants/theme";

// اقتراحات حين لا يوجد بحث سابق: كلمات مجرَّبة تعيد نتائج فعلاً، فلا تبدأ الصفحة فارغة
export const SUGGESTIONS = ["الدماغ", "النوم", "الفضاء", "الذكاء", "المال", "الحضارة", "الطاقة", "الجينات", "الفلسفة", "المناخ", "القلب", "الثقوب السوداء"];

export default function SearchSuggestions({ onPick }) {
  return (
    <section aria-label="اقتراحات" onMouseDown={(e) => e.preventDefault()} style={{ display: "grid", gap: S.lg }}>
      <span style={{ color: C.muted, fontSize: T.sm, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: S.md }}><Sparkles size={14} aria-hidden="true" />جرّب البحث عن</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: S.md }}>
        {SUGGESTIONS.map((q) => (
          <button key={q} type="button" onClick={() => onPick(q)} style={{ minHeight: TAP, padding: `0 ${S.x3}px`, borderRadius: R.pill, border: `1px solid ${C.line}`, background: C.surface, color: C.text, font: "inherit", fontSize: T.md, cursor: "pointer" }}>{q}</button>
        ))}
      </div>
    </section>
  );
}
