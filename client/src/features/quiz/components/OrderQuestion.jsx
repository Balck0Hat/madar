import { C, MONO } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { Btn } from "../../../shared/components/ui";

// سؤال ترتيب: النقر على العناصر بالترتيب يبني المصفوفة sel
export default function OrderQuestion({ items, sel, color, locked, onChange }) {
  const num = useNum();
  const chosen = sel || [];
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {items.map((it, k) => {
          const pos = chosen.indexOf(k);
          return (
            <button key={k} type="button" onClick={() => !locked && pos === -1 && onChange([...chosen, k])} style={{ background: pos >= 0 ? color + "33" : C.surface, border: `1px solid ${pos >= 0 ? color : C.line}`, borderRadius: 12, padding: "10px 14px", color: C.text, cursor: "pointer", fontSize: 15, display: "flex", gap: 8, alignItems: "center" }}>
              {pos >= 0 && <span style={{ fontFamily: MONO, color, fontWeight: 800 }}>{num(pos + 1)}</span>}{it}
            </button>
          );
        })}
      </div>
      {chosen.length > 0 && !locked && <Btn ghost full={false} small onClick={() => onChange([])}>تراجع</Btn>}
    </div>
  );
}
