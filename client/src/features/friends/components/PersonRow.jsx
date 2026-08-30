import { C, T, R, S } from "../../../shared/constants/theme";
import { personName } from "../utils/friends.utils";

// صف موحّد لكل قوائم الأصدقاء: حرف أول، اسم، سطر ثانوي، ثم أزرار الإجراء
export default function PersonRow({ person, sub, children }) {
  const name = personName(person);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: S.xl, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.xl, padding: `${S.xl}px ${S.x2}px` }}>
      <span aria-hidden="true" style={{ width: 32, height: 32, flexShrink: 0, borderRadius: R.pill, background: C.surface2, color: C.text, display: "grid", placeItems: "center", fontWeight: 700, fontSize: T.base }}>
        {name[0]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: T.md, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
        {sub && <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>}
      </div>
      <div style={{ display: "flex", gap: S.md, alignItems: "center", flexShrink: 0 }}>{children}</div>
    </div>
  );
}
