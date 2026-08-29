import { Marked, NoteToolbar, PrintUnitButton, useSelectionNote } from "../../notes";
import ThreadPage from "./ThreadPage";
import { SparkPage, GoalsPage, CardPage, TryPage, DeepPage, EndPage } from "./UnitPages";

// اختيار الصفحة حسب نوعها. مفصولة عن UnitScreen ليبقى الأخير مسؤولاً عن التنقّل وحده.
// طبقة التظليل تعيش هنا لا في UnitScreen: كل ما تحتاجه هو متن الصفحة ورقمها.
export default function PageBody({ p, index, content, info, quizCount, unitId }) {
  const notes = useSelectionNote(unitId, index);
  const mark = (text) => <Marked text={text} notes={notes.pageNotes} />;

  const body = () => {
    switch (p?.t) {
      case "spark": return <SparkPage info={info} content={{ ...content, quiz: { length: quizCount } }} mark={mark} />;
      case "goals": return <GoalsPage goals={content.goals} />;
      case "card": return <CardPage card={p.c} index={index - 1} total={content.cards.length} color={info.color} mark={mark} />;
      case "try": return <TryPage tryIt={content.tryIt} color={info.color} mark={mark} />;
      case "deep": return <DeepPage deep={content.deep} mark={mark} />;
      case "thread": return <ThreadPage thread={content.thread} />;
      case "end": return <EndPage summary={content.summary} mark={mark} action={<PrintUnitButton unitId={unitId} unit={content} info={info} paper small />} />;
      default: return null;
    }
  };

  return (
    // UnitScreen يمنع التحديد على كامل الشريحة ليصفو السحب؛ نعيده هنا وحده لأن
    // متن الدرس هو المكان الوحيد الذي يُظلَّل فيه، والنقر بعد تحديد لا يقلب الصفحة.
    <div ref={notes.ref} onClick={notes.onClick} style={{ userSelect: "text", WebkitUserSelect: "text" }}>
      {body()}
      <NoteToolbar sel={notes.sel} busy={notes.busy} err={notes.err} onClose={notes.close} onSave={notes.save} onEdit={notes.edit} onRemove={notes.remove} />
    </div>
  );
}
