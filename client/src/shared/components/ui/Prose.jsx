import { S } from "../../constants/theme";
import { paragraphs } from "../../utils/prose";

// متن مقسَّم إلى فقرات. النصّ القصير يعود كما هو بلا غلاف، فلا يتغيّر تخطيط
// المواضع التي تضعه داخل صفّ (كبنود الخلاصة) ولا تنشأ فقرة من سطر واحد.
export default function Prose({ text }) {
  const paras = paragraphs(text);
  if (paras.length <= 1) return paras[0] ?? null;
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} style={{ margin: i === 0 ? 0 : `${S.x2}px 0 0` }}>{p}</p>
      ))}
    </>
  );
}
