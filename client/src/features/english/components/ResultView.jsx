import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";
import WritingFeedback from "./WritingFeedback";
import SkillsReport from "./SkillsReport";
import PlanView from "./PlanView";

const PART = { grammar: "القواعد والمفردات", reading: "القراءة", listening: "الاستماع", writing: "الكتابة" };
const CONF = { high: "ثقة عالية", medium: "ثقة متوسطة", low: "ثقة منخفضة" };

// عنوان المستوى: مستوى واحد حين الثقة عالية، ومدى «بين B1 وB2» حين لا يُحسم
const headline = (r) => (r.range?.length === 2 && r.range[0] !== r.range[1] ? `${r.range[0]}–${r.range[1]}` : r.level);

// النتيجة: المستوى ومدى الثقة، ما يقابله في الآيلتس والتوفل، كل مهارة، تصحيح الكتابة،
// نقاط القوة والضعف بالموضوع، خطة الأسبوعين، ثم التوصية
export default function ResultView({ result, writing, onRetake, onGo }) {
  const num = useNum();
  if (!result) return <div style={{ color: C.muted }}>لم تكتمل الجلسة بما يكفي لتقدير المستوى.</div>;
  const w = writing || {};
  return (
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ textAlign: "center", background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x5, boxShadow: "var(--shadow-1)" }}>
        <div style={{ color: C.muted, fontSize: T.sm }}>مستواك التقريبي</div>
        <div dir="ltr" style={{ fontSize: headline(result).length > 2 ? T.x5 : T.display, fontWeight: 700, color: C.gold, lineHeight: 1.1, fontFamily: "Georgia, serif" }}>{headline(result)}</div>
        <div style={{ fontWeight: 700, fontSize: T.x2 }}>{result.label}{result.confidence ? <span style={{ fontWeight: 400, color: C.muted, fontSize: T.sm }}> · {CONF[result.confidence]}</span> : null}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: S.x3, marginTop: S.x2, flexWrap: "wrap" }}>
          <span style={{ fontSize: T.sm, background: alpha(C.gold, 0.12), borderRadius: R.pill, padding: `${S.sm}px ${S.x2}px` }}>آيلتس نحو {num(result.ielts)}</span>
          <span style={{ fontSize: T.sm, background: alpha(C.gold, 0.12), borderRadius: R.pill, padding: `${S.sm}px ${S.x2}px` }}>توفل نحو {num(result.toefl)}</span>
        </div>
        <div style={{ color: C.muted, fontSize: T.xs, marginTop: S.x2, lineHeight: 1.7 }}>
          {result.confidence === "low" ? "الأسئلة لم تستقر على مستوى واضح أو كانت قليلة؛ أعد الاختبار في يوم آخر لتقدير أدق." : "تقدير من اختبار قصير لا درجة رسمية؛ الامتحان الحقيقي أطول وأدق."}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: S.lg }}>
        {Object.entries(PART).map(([k, label]) => (
          <div key={k} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, textAlign: "center" }}>
            <div style={{ color: C.muted, fontSize: T.xs }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: T.x3, fontFamily: "Georgia, serif" }}>{result.parts?.[k] || (k === "writing" ? (w.status === "pending" ? "…" : "—") : "—")}</div>
            {k === "writing" && w.status === "pending" && <div style={{ color: C.muted, fontSize: T.xs }}>جارٍ التصحيح</div>}
          </div>
        ))}
      </div>
      <WritingFeedback writing={w} />
      <SkillsReport skills={result.skills} kinds={result.kinds} />
      <PlanView plan={result.plan} />
      {result.recommendation && (
        <div style={{ background: alpha(C.gold, 0.08), border: `1px solid ${alpha(C.gold, 0.35)}`, borderRadius: R.x2, padding: S.x3, lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, marginBottom: S.sm }}>من أين تبدأ</div>{result.recommendation.text}
        </div>
      )}
      <div style={{ display: "flex", gap: S.lg }}>
        {onGo && <Btn primary onClick={() => onGo(result.recommendation?.track)}>افتح المسار المقترح</Btn>}
        <Btn paper full={false} onClick={onRetake}>أعد الاختبار</Btn>
      </div>
    </div>
  );
}
