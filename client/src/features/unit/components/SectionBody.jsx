import { PrintUnitButton } from "../../notes";
import ThreadPage from "./ThreadPage";
import { SparkPage, GoalsPage, CardPage, TryPage, DeepPage, EndPage } from "./UnitPages";

const plain = (t) => t;

// متن قسم واحد بلا أي حالة. مفصول عن PageBody عمداً: وضع التمرير يعرض كل
// الأقسام دفعة واحدة، ولو حمل كل قسم خطّاف التظليل الخاص به لصار لكل درس
// عشرة طلبات شبكة وعشرة أشرطة تظليل عائمة.
export default function SectionBody({ p, content, info, quizCount, unitId, mark = plain, hint = true }) {
  switch (p?.t) {
    case "spark":
      return <SparkPage info={info} hint={hint} content={{ ...content, cards: content.cards || [], quiz: { length: quizCount } }} mark={mark} />;
    case "goals":
      return <GoalsPage goals={content.goals || []} />;
    case "card":
      return <CardPage card={p.c} index={p.n} total={(content.cards || []).length} color={info.color} mark={mark} />;
    case "try":
      return <TryPage tryIt={content.tryIt} color={info.color} mark={mark} />;
    case "deep":
      return <DeepPage deep={content.deep} mark={mark} />;
    case "thread":
      return <ThreadPage thread={content.thread} />;
    case "end":
      return <EndPage summary={content.summary || []} mark={mark} action={<PrintUnitButton unitId={unitId} unit={content} info={info} paper small />} />;
    default:
      return null;
  }
}
