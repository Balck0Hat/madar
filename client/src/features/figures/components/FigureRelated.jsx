import { ArrowLeft } from "lucide-react";
import { P, R, S, TAP, alpha } from "../../../shared/constants/theme";
import { related, nextOf } from "../utils/figureText";
import { colorOf } from "./figures.meta";

// ذيل الملف: من ذُكر في نصّه (يُستخرج من الأسماء لا من قائمة يدوية)، ثم
// التالي بالترتيب. الملفات كانت جزراً؛ هذا ما يجعلها مساراً.
const Row = ({ f, onOpen, big = false }) => {
  const color = colorOf(f.category);
  return (
    <button type="button" onClick={() => onOpen(f.figureId)} className="madar-press"
      style={{ display: "flex", alignItems: "center", gap: S.x2, width: "100%", minHeight: TAP, textAlign: "start", fontFamily: "inherit", cursor: "pointer",
        background: big ? alpha(color, 0.1) : P.card, border: `1px solid ${big ? color : P.line}`, borderRadius: R.x2, padding: `${S.x2}px ${S.x3}px`, color: P.ink }}>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "block", fontWeight: 700, fontSize: big ? "1.05em" : ".95em" }}>{f.name}</span>
        <span style={{ display: "block", color: P.muted, fontSize: ".8em", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{f.why}</span>
      </span>
      <ArrowLeft size={16} color={color} aria-hidden="true" />
    </button>
  );
};

export default function FigureRelated({ figure, list = [], onOpen }) {
  const rel = related(figure, list);
  const next = nextOf(figure, list);
  if (!rel.length && !next) return null;
  return (
    <div style={{ display: "grid", gap: S.x3 }}>
      {rel.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: ".9em", marginBottom: S.lg }}>ذُكروا في قصته</div>
          <div style={{ display: "grid", gap: S.lg }}>{rel.map((f) => <Row key={f.figureId} f={f} onOpen={onOpen} />)}</div>
        </div>
      )}
      {next && (
        <div>
          <div style={{ fontWeight: 700, fontSize: ".9em", marginBottom: S.lg }}>التالي في القائمة</div>
          <Row f={next} onOpen={onOpen} big />
        </div>
      )}
    </div>
  );
}
