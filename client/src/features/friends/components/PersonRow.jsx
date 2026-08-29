import { C } from "../../../shared/constants/theme";
import { personName } from "../utils/friends.utils";

// صف موحّد لكل قوائم الأصدقاء: حرف أول، اسم، سطر ثانوي، ثم أزرار الإجراء
export default function PersonRow({ person, sub, children }) {
  const name = personName(person);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 12px" }}>
      <span aria-hidden="true" style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 99, background: C.surface2, color: C.text, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>
        {name[0]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
        {sub && <div style={{ color: C.muted, fontSize: 12, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>{children}</div>
    </div>
  );
}
