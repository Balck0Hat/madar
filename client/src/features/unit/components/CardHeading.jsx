import { P, READ, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { headingShape } from "../utils/cardShape";

// عنوان البطاقة على شكله: التعريف مصطلحاً كبيراً وشرحه تحته بخط النسخ،
// والسؤال بخط النسخ كسؤال، والباقي كما كان. النصّ لا يتغيّر، تقطيعه فقط.
export default function CardHeading({ h, index, color }) {
  const num = useNum();
  const shape = headingShape(h);
  const eyebrow = { color: color || P.gold, fontSize: ".75em", fontWeight: 600, marginTop: S.x3 };
  if (shape.kind === "definition") {
    return (
      <>
        <div style={eyebrow}>البطاقة {num(index)}</div>
        <div style={{ fontSize: "1.5em", fontWeight: 700, marginTop: S.sm, lineHeight: 1.3 }}>{shape.term}</div>
        <div style={{ fontFamily: READ, fontSize: "1.05em", color: P.muted, margin: `${S.sm}px 0 ${S.xl}px`, lineHeight: 1.6 }}>{shape.gloss}</div>
      </>
    );
  }
  if (shape.kind === "question") {
    return (
      <>
        <div style={eyebrow}>البطاقة {num(index)} · سؤال</div>
        <div style={{ fontFamily: READ, fontSize: "1.5em", fontWeight: 600, margin: `${S.sm}px 0 ${S.xl}px`, lineHeight: 1.45 }}>{h}</div>
      </>
    );
  }
  return (
    <>
      <div style={eyebrow}>البطاقة {num(index)}</div>
      <div style={{ fontSize: "1.38em", fontWeight: 700, margin: `${S.sm}px 0 ${S.xl}px`, lineHeight: 1.4 }}>{h}</div>
    </>
  );
}
