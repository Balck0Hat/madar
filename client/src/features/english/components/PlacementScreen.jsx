import { useEffect, useState } from "react";
import { C, R, S, T } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import { getPlacement, startPlacement, answerPlacement, submitWriting, skipWriting } from "../services/english.service";
import Choice from "./Choice";
import PartRunner from "./PartRunner";
import WritingPart from "./WritingPart";
import ResultView from "./ResultView";

const STAGES = ["grammar", "reading", "listening", "writing", "done"];
const LABEL = { grammar: "قواعد ومفردات", reading: "قراءة", listening: "استماع", writing: "كتابة", done: "النتيجة" };

// اختبار تحديد المستوى: مرحلة تلو الأخرى، والخادم يقرر السؤال التالي ومستواه.
// الكتابة اختيارية وتُصحَّح في الخلفية؛ صفحة النتيجة تتحدّث حين ينتهي التصحيح.
export default function PlacementScreen({ onBack, onGo }) {
  const num = useNum();
  const [session, setSession] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [picked, setPicked] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const { data, loading, error, reload } = useAsync(() => getPlacement(), []);
  useEffect(() => { if (data) setSession(data.session); }, [data]);
  // النتيجة تنتظر تصحيح الكتابة: استطلع كل خمس ثوانٍ حتى يكتمل
  useEffect(() => {
    if (session?.stage !== "done" || session?.writing?.status !== "pending") return undefined;
    const t = setInterval(() => getPlacement().then((d) => setSession(d.session)).catch(() => {}), 5000);
    return () => clearInterval(t);
  }, [session?.stage, session?.writing?.status]);

  const guard = async (fn) => { setBusy(true); setErr(""); try { await fn(); } catch (e) { setErr(e.message || "تعذّر الاتصال"); } finally { setBusy(false); } };
  const start = () => guard(async () => { setFeedback(null); setPicked(null); setSession(await startPlacement()); });
  const answer = (itemId, choice) => guard(async () => { const r = await answerPlacement(session.id, itemId, choice); setFeedback({ itemId, a: r.a, why: r.why, next: r.next }); });
  const goNext = () => { setSession(feedback.next); setFeedback(null); setPicked(null); };

  const shell = (children) => (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="تحديد المستوى" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>
        {session && session.stage !== "done" && (
          <div style={{ display: "flex", gap: S.sm }} aria-label="مراحل الاختبار">
            {STAGES.slice(0, 4).map((st) => <span key={st} title={LABEL[st]} style={{ flex: 1, height: 4, borderRadius: R.pill, background: STAGES.indexOf(st) <= STAGES.indexOf(session.stage) ? C.gold : C.line }} />)}
          </div>
        )}
        {err && <div role="alert" style={{ color: C.red, fontSize: T.sm }}>{err}</div>}
        {children}
      </div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={6} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);

  if (!session) return shell(
    <div style={{ display: "grid", gap: S.x3 }}>
      <h1 style={{ fontSize: T.x4, fontWeight: 700, margin: 0 }}>اختبار تحديد المستوى</h1>
      <p style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}>نحو 25 دقيقة، أربعة أجزاء: 20 سؤال قواعد ومفردات تتكيّف مع إجاباتك، ثم مقطعا قراءة، ثم مقطعا استماع بصوت المتصفح، ثم كتابة قصيرة اختيارية يصحّحها نموذج لغوي على الخادم. النتيجة: مستواك الأوروبي وما يقابله في الآيلتس والتوفل، ومن أين تبدأ.</p>
      <Btn primary onClick={start} disabled={busy}>ابدأ</Btn>
      {data?.history?.length > 0 && <div style={{ color: C.muted, fontSize: T.sm }}>آخر نتيجة: {data.history[0].result?.level || "—"} في {num(new Date(data.history[0].finishedAt).toLocaleDateString("ar"))}</div>}
    </div>,
  );

  if (session.stage === "grammar" && session.item) return shell(
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ color: C.muted, fontSize: T.xs }}>قواعد ومفردات · {num(session.n)} من {num(session.of)}</div>
      <Choice q={session.item.q} opts={session.item.opts} picked={picked} answer={feedback?.a} why={feedback?.why} onPick={(i) => { setPicked(i); answer(session.item.id, i); }} />
      {feedback && <Btn primary onClick={goNext}>التالي</Btn>}
    </div>,
  );
  if ((session.stage === "reading" || session.stage === "listening") && session.part) return shell(
    <PartRunner key={session.part.id} stage={session.stage} part={session.part} feedback={feedback} onAnswer={answer} onNext={goNext} />,
  );
  if (session.stage === "writing" && session.writing) return shell(
    <WritingPart writing={session.writing} busy={busy} onSubmit={(text) => guard(async () => setSession(await submitWriting(session.id, text)))} onSkip={() => guard(async () => setSession(await skipWriting(session.id)))} />,
  );
  return shell(<ResultView result={session.result} writing={session.writing} onRetake={start} onGo={onGo} />);
}
