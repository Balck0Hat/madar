import { Marked, NoteToolbar, useSelectionNote } from "../../notes";
import SectionBody from "./SectionBody";

// صفحة واحدة في وضع البطاقات: طبقة التظليل + متن القسم.
// طبقة التظليل تعيش هنا لا في UnitScreen: كل ما تحتاجه هو متن الصفحة ورقمها.
export default function PageBody({ p, index, content, info, quizCount, unitId }) {
  const notes = useSelectionNote(unitId, index);
  const mark = (text) => <Marked text={text} notes={notes.pageNotes} />;

  return (
    // UnitScreen يمنع التحديد على كامل الشريحة ليصفو السحب؛ نعيده هنا وحده لأن
    // متن الدرس هو المكان الوحيد الذي يُظلَّل فيه، والنقر بعد تحديد لا يقلب الصفحة.
    <div ref={notes.ref} onClick={notes.onClick} style={{ userSelect: "text", WebkitUserSelect: "text" }}>
      <SectionBody p={p} content={content} info={info} quizCount={quizCount} unitId={unitId} mark={mark} />
      <NoteToolbar sel={notes.sel} busy={notes.busy} err={notes.err} onClose={notes.close} onSave={notes.save} onEdit={notes.edit} onRemove={notes.remove} />
    </div>
  );
}
