import { Flame, Target } from "lucide-react";
import { C, MONO, alpha, T, R } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { Card, Pill, Skeleton, ErrorState } from "../../../shared/components/ui";
import { useChallenge, CHALLENGE_XP } from "../hooks/useChallenge";
import ChallengeQuestion from "./ChallengeQuestion";

const Head = ({ children }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
    <div style={{ fontWeight: 800, display: "flex", gap: 8, alignItems: "center" }}><Target size={16} color={C.gold} />تحدي اليوم</div>
    {children}
  </div>
);

// بطاقة مضغوطة على الخريطة: سؤال واحد، إجابة واحدة، ثم التفسير والسلسلة
export default function ChallengeCard({ onToast }) {
  const num = useNum();
  const ch = useChallenge();

  const send = async (answer) => {
    const res = await ch.submit(answer);
    if (!res) return;
    // النقاط تُمنح على أول إجابة صحيحة في اليوم فقط
    if (res.correct) onToast?.(`إجابة صحيحة · +${num(CHALLENGE_XP)} XP`);
  };

  if (ch.loading) return <Card><Head /><div style={{ marginTop: 8 }}><Skeleton lines={2} /></div></Card>;
  if (ch.error) return <Card><Head /><div style={{ marginTop: 10 }}><ErrorState message={ch.error.message} onRetry={ch.reload} /></div></Card>;
  if (!ch.question) return <Card><Head /><div style={{ color: C.muted, fontSize: T.base, marginTop: 6, lineHeight: 1.7 }}>لا تحدي اليوم، عد غداً.</div></Card>;

  const streakPill = ch.streak > 0 && <Pill color={C.gold}><span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Flame size={12} />{num(ch.streak)}</span></Pill>;
  const verdict = ch.correct ? C.green : C.red;

  // أُجيب في جلسة سابقة: نعرض الحصيلة لا السؤال، حتى لا يبدو قابلاً للإجابة
  if (ch.answered && !ch.result) {
    return (
      <Card accent={verdict}>
        <Head>{streakPill}</Head>
        <div style={{ fontWeight: 700, marginTop: 8, fontSize: T.md, color: verdict }}>{ch.correct ? "أجبت اليوم إجابة صحيحة" : "أجبت اليوم، والإجابة لم تكن صحيحة"}</div>
        <div style={{ color: C.muted, fontSize: T.base, marginTop: 4, fontFamily: MONO }}>سلسلة التحدي: {num(ch.streak)} يوماً</div>
      </Card>
    );
  }

  return (
    <Card accent={ch.result ? verdict : C.gold}>
      <Head>{ch.result ? <Pill color={verdict}>{ch.correct ? `+${num(CHALLENGE_XP)} XP` : "غداً فرصة أخرى"}</Pill> : streakPill}</Head>
      <div style={{ fontSize: T.lg, fontWeight: 700, marginTop: 8, lineHeight: 1.6 }}>{ch.question.q}</div>
      <ChallengeQuestion question={ch.question} result={ch.result} submitting={ch.submitting} onSubmit={send} />
      {ch.submitError && <div role="alert" style={{ marginTop: 8, fontSize: T.base, color: C.red }}>{ch.submitError.message}</div>}
      {ch.result && (
        <div className="madar-in" role="status" style={{ marginTop: 10, background: alpha(verdict, 0.12), border: `1px solid ${alpha(verdict, 0.4)}`, borderRadius: R.lg, padding: "10px 12px" }}>
          <div style={{ fontWeight: 800, color: verdict, fontSize: T.base }}>{ch.correct ? "صحيح" : "ليست الإجابة"}</div>
          {ch.result.why && <div style={{ fontSize: T.base, lineHeight: 1.7, marginTop: 4 }}>{ch.result.why}</div>}
          <div style={{ color: C.muted, fontSize: T.sm, marginTop: 6, fontFamily: MONO }}>سلسلة التحدي: {num(ch.streak)} يوماً</div>
        </div>
      )}
    </Card>
  );
}
