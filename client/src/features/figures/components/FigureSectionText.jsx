import { READ } from "../../../shared/constants/theme";
import Prose from "../../../shared/components/ui/Prose";
import { Marked, NoteToolbar, useSelectionNote } from "../../notes";

export const body = { fontFamily: READ, fontSize: "1.07em", lineHeight: 1.95 };

// متن قسم مع طبقة التظليل نفسها التي في الدروس: التحديد يفتح شريط الملاحظة،
// والتظليل يُحفظ على الحساب تحت معرّف «figure:<الشخصية>» ورقم القسم.
function Highlightable({ noteId, page, text }) {
  const notes = useSelectionNote(noteId, page);
  return (
    <div ref={notes.ref} onClick={notes.onClick} style={{ ...body, userSelect: "text", WebkitUserSelect: "text" }}>
      <Marked text={text} notes={notes.pageNotes} mono />
      <NoteToolbar sel={notes.sel} busy={notes.busy} err={notes.err} onClose={notes.close} onSave={notes.save} onEdit={notes.edit} onRemove={notes.remove} />
    </div>
  );
}

// بلا حساب (الصفحة العامة) لا تظليل: النثر وحده
export default function FigureSectionText({ noteId, page, text }) {
  if (!noteId) return <div style={body}><Prose text={text} mono /></div>;
  return <Highlightable noteId={noteId} page={page} text={text} />;
}
