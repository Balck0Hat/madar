import { P, MONO, R, S, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { span, contemporaries, yearNum } from "../utils/figureText";
import { yearLabel } from "./figures.meta";

// شريط زمني واحد لكل الشخصيات: امتداد هذه الشخصية شريطاً ملوّناً، وسائر
// القائمة نقاطاً باهتة. المدى من أقدم مولد إلى أحدث وفاة في القائمة، فيكبر
// وحده كلما أُضيف أحد. «عاصره» سطراً لأن الأسماء لا تتسع تحت النقاط.
export default function FigureTimeline({ figure, list = [], color }) {
  const num = useNum();
  const me = span(figure);
  if (!me || list.length < 2) return null;
  const spans = list.map(span).filter(Boolean);
  const lo = Math.floor(Math.min(...spans.map((s) => s.from)) / 100) * 100;
  const hi = Math.ceil(Math.max(...spans.map((s) => s.to)) / 100) * 100;
  const at = (y) => ((y - lo) / (hi - lo)) * 100;
  const peers = contemporaries(figure, list);
  const yl = (y) => num(yearLabel(String(y)) || y);

  return (
    <div style={{ marginTop: S.x4 }}>
      <div aria-label={`عاش بين ${yl(me.from)} و${yl(me.to)}`} role="img" style={{ position: "relative", height: S.x5 }}>
        <span aria-hidden="true" style={{ position: "absolute", insetInline: 0, top: "50%", height: 2, background: P.line, borderRadius: R.pill }} />
        {list.filter((o) => o.figureId !== figure.figureId).map((o) => {
          const b = yearNum(o.born);
          return b === null ? null : (
            <span key={o.figureId} aria-hidden="true" title={o.name} style={{ position: "absolute", insetInlineStart: `${at(b)}%`, top: "50%", width: 8, height: 8, marginInlineStart: -4, marginTop: -4, borderRadius: R.pill, background: P.muted, opacity: 0.55 }} />
          );
        })}
        {/* الزمن يجري مع اتجاه القراءة: الأقدم في جهة البداية */}
        <span aria-hidden="true" style={{ position: "absolute", insetInlineStart: `${at(me.from)}%`, width: `${Math.max(1.2, at(me.to) - at(me.from))}%`, top: "50%", height: 8, marginTop: -4, borderRadius: R.pill, background: color, boxShadow: `0 0 0 3px ${alpha(color, 0.25)}` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: ".7em", color: P.muted, marginTop: S.xs }}>
        <span>{yl(lo)}</span><span>{yl(hi)}</span>
      </div>
      {peers.length > 0 && (
        <div style={{ color: P.muted, fontSize: ".82em", lineHeight: 1.7, marginTop: S.md }}>
          <span style={{ color, fontWeight: 700 }}>عاصره: </span>{peers.map((o) => o.name).join("، ")}
        </div>
      )}
    </div>
  );
}
