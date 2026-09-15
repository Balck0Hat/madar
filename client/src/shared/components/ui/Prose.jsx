import { S } from "../../constants/theme";
import { paragraphs } from "../../utils/prose";
import Decorated from "./Decorated";

// متن مقسَّم إلى فقرات. النصّ القصير يعود كما هو بلا غلاف، فلا يتغيّر تخطيط
// المواضع التي تضعه داخل صفّ (كبنود الخلاصة) ولا تنشأ فقرة من سطر واحد.
// mono: الأرقام بخط الأرقام، للسير التاريخية المليئة بالسنوات.
export default function Prose({ text, mono = false }) {
  const paras = paragraphs(text);
  if (paras.length <= 1) return paras[0] ? <Decorated text={paras[0]} mono={mono} /> : null;
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} style={{ margin: i === 0 ? 0 : `${S.x2}px 0 0` }}><Decorated text={p} mono={mono} /></p>
      ))}
    </>
  );
}
