import { P, MONO, R, S } from "../../../../shared/constants/theme";
import { useNum } from "../../../../shared/context/PrefsContext";

// خطّ زمني من سنوات النصّ: سكّة رأسية، نقطة لكل سنة، والتسمية مقتطعة من
// الجملة التي وردت فيها. لا محاور ولا مقاييس: ترتيبٌ يُرى، لا رسم بياني.
export default function Timeline({ items = [], color }) {
  const num = useNum();
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: `${S.md}px 0`, display: "grid", gap: S.x2, position: "relative" }}>
      <span aria-hidden="true" style={{ position: "absolute", insetInlineStart: 44, top: S.lg, bottom: S.lg, width: 2, background: P.line, borderRadius: R.pill }} />
      {items.map((it, i) => (
        <li key={i} style={{ display: "grid", gridTemplateColumns: "40px 12px minmax(0, 1fr)", gap: S.lg, alignItems: "start", animation: "madarRise .22s cubic-bezier(.2,.7,.3,1) both", animationDelay: `${i * 40}ms` }}>
          <span style={{ fontFamily: MONO, fontWeight: 700, color, fontSize: ".9em", textAlign: "end", lineHeight: 1.4, paddingTop: S.xs }}>{num(it.y)}</span>
          <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: R.pill, background: color, marginTop: "0.35em", justifySelf: "center", boxShadow: `0 0 0 3px ${P.bg}` }} />
          <span style={{ fontSize: ".9em", lineHeight: 1.55, color: P.ink }}>{it.l}</span>
        </li>
      ))}
    </ol>
  );
}
