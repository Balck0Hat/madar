import { P, MONO, R, S, alpha } from "../../../../shared/constants/theme";
import { useNum } from "../../../../shared/context/PrefsContext";

// أشرطة الأضعاف: طول كل شريط نسبة قيمته إلى الأكبر. القيم من النصّ حرفياً،
// ولا رسم إن كانت النسبة بين الأكبر والأصغر تجعل الصغير خطاً لا يُرى.
export default function Bars({ items = [], unit = "", color }) {
  const num = useNum();
  const max = Math.max(...items.map((it) => it.v), 0) || 1;
  return (
    <div style={{ display: "grid", gap: S.xl, padding: `${S.md}px 0` }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gap: S.sm, animation: "madarRise .22s cubic-bezier(.2,.7,.3,1) both", animationDelay: `${i * 40}ms` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: S.lg, fontSize: ".88em", lineHeight: 1.4 }}>
            <span style={{ color: P.ink, minWidth: 0 }}>{it.l}</span>
            <span style={{ fontFamily: MONO, fontWeight: 700, color, flexShrink: 0 }}>{num(it.v)}{unit ? ` ${unit}` : ""}</span>
          </div>
          <div style={{ height: 10, borderRadius: R.pill, background: alpha(P.ink, 0.08), overflow: "hidden" }}>
            <div style={{ width: `${Math.max(2, (it.v / max) * 100)}%`, height: "100%", borderRadius: R.pill, background: alpha(color, 0.85), transition: "width .5s cubic-bezier(.2,.7,.3,1)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
