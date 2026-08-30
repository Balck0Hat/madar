import { R } from "../../../shared/constants/theme";
import { splitHighlights, tintBg, tintOf } from "../utils/highlight";

const press = (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  e.currentTarget.click(); // نمرّر النقرة للحاوية التي تعرف كيف تفتح شريط التظليل
};

// يعرض نصاً مع تظليلات القارئ داخله. بلا تظليلات يعود النص كما هو تماماً.
export default function Marked({ text, notes = [] }) {
  const parts = splitHighlights(text, notes);
  // لا تظليل هنا: نعيد النص كما هو بلا أي غلاف زائد
  if (!parts.length || (parts.length === 1 && !parts[0].note)) return text;
  return (
    <>
      {parts.map((part) =>
        part.note ? (
          <mark
            key={part.key}
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
          <span key={part.key}>{part.text}</span>
        ),
      )}
    </>
  );
}
