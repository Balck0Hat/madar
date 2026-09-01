import { Award, Check, X } from "lucide-react";
import { C, MONO, alpha, T, R, S } from "../../../shared/constants/theme";
import { DOMAINS } from "../../../shared/data/domains";
import { Btn, Card, Confetti } from "../../../shared/components/ui";

const arDate = (d) => new Date(d).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" });
const nameOf = (id) => (id === "center" ? "المركز" : DOMAINS.find((d) => d.id === id)?.name || id);

// الناجح يرى مراجعة كاملة، والراسب يرى خريطة مجالاته.
// الخادم كان يرسل مفتاح الإجابات للأربعين في الحالتين والواجهة لا تعرضه:
// تسريب للبنك المحجوز بلا فائدة. الآن المفتاح للناجح وحده — انتهى امتحانه —
// والراسب يعرف أين يراجع دون أن تُسبق إليه إجابات إعادته بعد ثلاثين يوماً.
export default function ExamResult({ result, num, onBack }) {
  const { passed, score, total, expired, certificate, review, domains, reopensAt } = result;
  return (
    <div style={{ paddingTop: S.x4 }}>
      <div style={{ textAlign: "center" }}>
        {passed && <Confetti color={C.gold} />}
        <Award size={48} color={passed ? C.gold : C.muted} />
        <div style={{ fontSize: T.x5, fontWeight: 700, marginTop: S.xl }}>{passed ? "اجتزت امتحان الإتمام" : "لم تجتز هذه المرة"}</div>
        <div style={{ fontFamily: MONO, fontSize: T.x4, color: passed ? C.gold : C.red, marginTop: S.md }}>{num(score)}/{num(total)}</div>
        {expired && <div style={{ color: C.muted, fontSize: T.base, marginTop: S.md }}>انتهى الوقت، وصُحِّح ما أجبت عنه.</div>}
        <div style={{ color: C.muted, marginTop: S.lg, lineHeight: 1.7 }}>
          {passed
            ? `رمز شهادتك: ${certificate.code} — شهادة إتمام، والامتحان غير مراقَب.`
            : `النجاح يحتاج ثمانين بالمئة. المحاولة القادمة تُفتح في ${arDate(reopensAt)}.`}
        </div>
      </div>

      {!passed && domains && (
        <div style={{ marginTop: S.x5, display: "grid", gap: S.lg }}>
          <div style={{ fontWeight: 700 }}>أين تراجع</div>
          {Object.entries(domains).sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total).map(([id, d]) => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: S.x2, fontSize: T.md }}>
              <span style={{ flex: 1 }}>{nameOf(id)}</span>
              <span style={{ fontFamily: MONO, color: d.correct === d.total ? C.green : d.correct * 2 < d.total ? C.red : C.muted }}>
                {num(d.correct)}/{num(d.total)}
              </span>
            </div>
          ))}
        </div>
      )}

      {passed && review && (
        <div style={{ marginTop: S.x5, display: "grid", gap: S.x2 }}>
          <div style={{ fontWeight: 700 }}>المراجعة</div>
          {review.map((g, k) => (
            <Card key={g.qid + k} accent={g.ok ? C.green : C.red} style={{ padding: S.x2 }}>
              <div style={{ display: "flex", gap: S.lg, alignItems: "flex-start" }}>
                {g.ok ? <Check size={16} color={C.green} style={{ flexShrink: 0, marginTop: S.xs }} />
                      : <X size={16} color={C.red} style={{ flexShrink: 0, marginTop: S.xs }} />}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: T.md, lineHeight: 1.7 }}>{g.q}</div>
                  {g.why && (
                    <div style={{ color: C.muted, fontSize: T.base, lineHeight: 1.7, marginTop: S.md, background: alpha(C.text, 0.04), borderRadius: R.md, padding: S.lg }}>
                      {g.why}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ marginTop: S.x5 }}><Btn primary onClick={onBack}>{passed ? "اعرض الشهادة" : "العودة"}</Btn></div>
    </div>
  );
}
