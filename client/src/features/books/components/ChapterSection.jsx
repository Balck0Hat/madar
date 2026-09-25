import { P, READ, S } from "../../../shared/constants/theme";
import { Marked, NoteToolbar, useSelectionNote } from "../../notes";

export const body = { fontFamily: READ, fontSize: "1.07em", lineHeight: 1.95 };

// قسم من فصل مع طبقة التظليل نفسها التي في الدروس والقصص: التحديد يفتح شريط
// الملاحظة، والتظليل يُحفظ تحت «book:<الكتاب>:<الفصل>» ورقم القسم.
export default function ChapterSection({ noteId, index, heading, text, color }) {
  const notes = useSelectionNote(noteId, index);
  return (
    <section ref={notes.ref} onClick={notes.onClick} style={{ userSelect: "text", WebkitUserSelect: "text" }}>
      <h2 style={{ fontSize: "1.32em", fontWeight: 700, margin: `${S.x5}px 0 ${S.x2}px`, lineHeight: 1.4, color: P.ink, borderInlineStart: `3px solid ${color}`, paddingInlineStart: S.x2 }}>{heading}</h2>
      <div style={body}><Marked text={text} notes={notes.pageNotes} /></div>
      <NoteToolbar sel={notes.sel} busy={notes.busy} err={notes.err} onClose={notes.close} onSave={notes.save} onEdit={notes.edit} onRemove={notes.remove} />
    </section>
  );
}
