import { R, S } from "../../../shared/constants/theme";
import { paragraphRanges } from "../../../shared/utils/prose";
import { splitHighlights, tintBg, tintOf } from "../utils/highlight";

const press = (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  e.currentTarget.click(); // نمرّر النقرة للحاوية التي تعرف كيف تفتح شريط التظليل
};

const Segment = ({ part }) =>
  part.note ? (
    <mark
      data-note-id={part.note.id}
      role="button"
      tabIndex={0}
      onKeyDown={press}
      title={part.note.note || "تظليل"}
      aria-label={part.note.note ? `تظليل مع ملاحظة: ${part.note.note}` : "تظليل"}
      style={{
        background: tintBg(part.note.color),
        color: "inherit",
        borderRadius: R.xs,
        padding: "0.08em 0.12em",
        cursor: "pointer",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
        borderBottom: part.note.note ? `2px solid ${tintOf(part.note.color)}` : "none",
      }}
    >
      {part.text}
    </mark>
  ) : (
    <span>{part.text}</span>
  );

// يعرض نصاً مقسَّماً إلى فقرات، مع تظليلات القارئ داخله.
//
// المطابقة تجري على النصّ الكامل أولاً ثم تُوزَّع مقاطعها على الفقرات: لو
// قُسّم النصّ أولاً ثم بُحث عن كل تظليل داخل فقرة، لاختفى كل تظليل يعبر حدّ
// فقرة — لأن البحث عن اقتباسه يفشل في الفقرتين معاً.
export default function Marked({ text, notes = [] }) {
  const src = String(text ?? "");
  const bounds = paragraphRanges(src);
  if (!bounds.length) return null;
  const parts = splitHighlights(src, notes);

  // موضع كل مقطع في النصّ الأصلي، ليُقصّ عند حدود الفقرات
  let at = 0;
  const placed = parts.map((p) => {
    const start = src.indexOf(p.text, at);
    const from = start === -1 ? at : start;
    at = from + p.text.length;
    return { ...p, start: from, end: from + p.text.length };
  });

  const inParagraph = (b) =>
    placed
      .filter((p) => p.end > b.start && p.start < b.end)
      .map((p) => ({ ...p, text: src.slice(Math.max(p.start, b.start), Math.min(p.end, b.end)) }))
      .filter((p) => p.text.trim())
      .map((p) => <Segment key={`${p.key}-${b.start}`} part={p} />);

  // فقرة واحدة: بلا غلاف، كما كان قبل التقسيم
  if (bounds.length === 1) return <>{inParagraph(bounds[0])}</>;

  return (
    <>
      {bounds.map((b, i) => (
        <p key={b.start} style={{ margin: i === 0 ? 0 : `${S.x2}px 0 0` }}>
          {inParagraph(b)}
        </p>
      ))}
    </>
  );
}
