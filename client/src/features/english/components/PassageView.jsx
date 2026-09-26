import { C, R, S, T, alpha } from "../../../shared/constants/theme";

// نصّ قراءة بفقرات موسومة (A، B… أو 1، 2…) كما في الامتحان، وعلامات الإدراج [1]…[4] في توفل تُعرض شارات
const MARK = /\[(\d)\]/g;
function withMarkers(text) {
  const out = [];
  let last = 0, m;
  while ((m = MARK.exec(text))) {
    out.push(text.slice(last, m.index));
    out.push(<span key={m.index} aria-label={`الموضع ${m[1]}`} style={{ display: "inline-block", minWidth: 18, textAlign: "center", fontSize: T.xs, fontWeight: 700, color: C.gold, background: alpha(C.gold, 0.14), borderRadius: R.sm, margin: `0 ${S.xs}px`, lineHeight: 1.4 }}>{m[1]}</span>);
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

export default function PassageView({ section, maxHeight = "48vh" }) {
  return (
    <article dir="ltr" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, textAlign: "left", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: T.lg, lineHeight: 1.8, maxHeight, overflowY: "auto" }}>
      <h3 style={{ margin: `0 0 ${S.sm}px`, fontSize: T.x2 }}>{section.title}</h3>
      {section.intro && <p style={{ margin: `0 0 ${S.lg}px`, color: C.muted, fontSize: T.sm, fontStyle: "italic" }}>{section.intro}</p>}
      {(section.paragraphs || []).map((p) => (
        <p key={p.label} style={{ margin: `0 0 ${S.lg}px` }}>
          <b style={{ color: C.gold, marginRight: S.md }}>{p.label}</b>{withMarkers(p.text)}
        </p>
      ))}
    </article>
  );
}
