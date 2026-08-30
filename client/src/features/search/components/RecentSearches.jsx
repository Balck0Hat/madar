import { Clock } from "lucide-react";
import { C, T, R, S } from "../../../shared/constants/theme";

// آخر ٥ عمليات بحث، تظهر حين يكون الحقل فارغاً وفي حالة تركيز.
// onMouseDown يمنع فقدان التركيز قبل أن يُسجَّل النقر على العنصر.
export default function RecentSearches({ items, onPick, onClear }) {
  if (!items.length) return null;
  return (
    <section aria-label="عمليات بحث سابقة" onMouseDown={(e) => e.preventDefault()} style={{ display: "grid", gap: S.md }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: C.muted, fontSize: T.sm, fontWeight: 600 }}>بحثت مؤخراً</span>
        <button type="button" onClick={onClear} style={{ background: "transparent", border: "none", color: C.muted, fontSize: T.sm, cursor: "pointer", padding: S.sm }}>مسح الكل</button>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: S.md }}>
        {items.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onPick(q)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: S.lg, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.lg, padding: `${S.xl}px ${S.x2}px`, color: C.text, font: "inherit", fontSize: T.md, cursor: "pointer", textAlign: "start" }}
            >
              <Clock size={14} color={C.muted} aria-hidden="true" />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
