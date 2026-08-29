import ThreadPage from "./ThreadPage";
import { SparkPage, GoalsPage, CardPage, TryPage, DeepPage, EndPage } from "./UnitPages";

// اختيار الصفحة حسب نوعها. مفصولة عن UnitScreen ليبقى الأخير مسؤولاً عن التنقّل وحده
export default function PageBody({ p, index, content, info, quizCount }) {
  switch (p?.t) {
    case "spark": return <SparkPage info={info} content={{ ...content, quiz: { length: quizCount } }} />;
    case "goals": return <GoalsPage goals={content.goals} />;
    case "card": return <CardPage card={p.c} index={index - 1} total={content.cards.length} />;
    case "try": return <TryPage tryIt={content.tryIt} />;
    case "deep": return <DeepPage deep={content.deep} />;
    case "thread": return <ThreadPage thread={content.thread} />;
    case "end": return <EndPage summary={content.summary} />;
    default: return null;
  }
}
