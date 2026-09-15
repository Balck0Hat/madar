import { P, S } from "../../../shared/constants/theme";
import CheckIn from "../../../shared/components/ui/CheckIn";
import FigureRelated from "./FigureRelated";

// ما بعد آخر قسم: سؤال سريع اختياري (مطويّ، لا نقاط ولا شرط)، ثم المصادر،
// ثم المرتبطون والتالي. الملف لا ينتهي فجأة بعد المصادر.
export default function FigureEnd({ figure, list, color, onOpen }) {
  const check = figure.check ? { t: "mcq", q: figure.check.q, opts: figure.check.opts, a: figure.check.a, why: figure.check.why } : null;
  return (
    <div style={{ display: "grid", gap: S.x5, marginTop: S.x4 }}>
      <CheckIn question={check} color={color} />
      {figure.sources?.length > 0 && (
        <div style={{ borderTop: `1px solid ${P.line}`, paddingTop: S.x2, color: P.muted, fontSize: ".8em", lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, marginBottom: S.sm }}>للاستزادة</div>
          {figure.sources.map((s, i) => <div key={i}>· {s}</div>)}
        </div>
      )}
      <FigureRelated figure={figure} list={list} onOpen={onOpen} />
    </div>
  );
}
