import { useCallback, useEffect, useState } from "react";
import { C, R, S, T } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import { getPlacement, startPlacement, answerPlacement, timeoutPlacement, submitWriting, skipWriting } from "../services/english.service";
import Choice from "./Choice";
import PartRunner from "./PartRunner";
import WritingPart from "./WritingPart";
import ResultView from "./ResultView";
import StageTimer from "./StageTimer";

const STAGES = ["grammar", "reading", "listening", "writing", "done"];
const LABEL = { grammar: "قواعد ومفردات", reading: "قراءة", listening: "استماع", writing: "كتابة", done: "النتيجة" };

// اختبار تحديد المستوى: مرحلة تلو الأخرى، والخادم يقرر السؤال التالي ومستواه ويحفظ مؤقّت كل جزء.
// الكتابة اختيارية وتُصحَّح في الخلفية؛ صفحة النتيجة تتحدّث حين ينتهي التصحيح.
export default function PlacementScreen({ onBack, onGo }) {
  const num = useNum();
  const [session, setSession] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [picked, setPicked] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const { data, loading, error, reload } = useAsync(() => getPlacement(), []);
  useEffect(() => { if (data) setSession(data.session); }, [data]);
  useEffect(() => {
    if (session?.stage !== "done" || session?.writing?.status !== "pending") return undefined;
    const t = setInterval(() => getPlacement().then((d) => setSession(d.session)).catch(() => {}), 5000);
    return () => clearInterval(t);
  }, [session?.stage, session?.writing?.status]);

  const guard = async (fn) => { setBusy(true); setErr(""); try { await fn(); } catch (e) { setErr(e.message || "تعذّر الاتصال"); } finally { setBusy(false); } };
  const fresh = (next) => { setSession(next); setFeedback(null); setPicked(null); };
  const start = () => guard(async () => { setNotice(""); fresh(await startPlacement()); });
  const answer = (itemId, choice) => guard(async () => {
    const r = await answerPlacement(session.id, itemId, choice);
    if (r.timedOut) { setNotice("انتهى وقت هذا الجزء، انتقلنا إلى التالي."); fresh(r.next); return; }
    setFeedback({ itemId, a: r.a, why: r.why, next: r.next });
  });
  const goNext = () => { setNotice(""); fresh(feedback.next); };
  const expire = useCallback(() => { if (!session) return; timeoutPlacement(session.id).then((s) => { setNotice("انتهى وقت هذا الجزء، انتقلنا إلى التالي."); fresh(s); }).catch(() => {}); }, [session?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const shell = (children) => (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="تحديد المستوى" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>
        {session && session.stage !== "done" && (
          <div style={{ display: "flex", gap: S.sm }} aria-label="مراحل الاختبار">
            {STAGES.slice(0, 4).map((st) => <span key={st} title={LABEL[st]} style={{ flex: 1, height: 4, borderRadius: R.pill, background: STAGES.indexOf(st) <= STAGES.indexOf(session.stage) ? C.gold : C.line }} />)}
          </div>
        )}
        {session?.timer && session.stage !== "done" && session.stage !== "writing" && <StageTimer timer={session.timer} onExpire={expire} />}
        {notice && <div role="status" style={{ color: C.gold, fontSize: T.sm }}>{notice}</div>}
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
      <p style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}>نحو 30 دقيقة، أربعة أجزاء بمؤقّت: 12 إلى 24 سؤال قواعد ومفردات تتكيّف مع إجاباتك وتتوقف حين يستقر مستواك، ثم مقطعا قراءة بأسئلة الآيلتس، ثم مقطعا استماع بأصوات بريطانية وأمريكية، ثم كتابة قصيرة اختيارية يصحّحها نموذج لغوي على الخادم. النتيجة: مستواك ومدى الثقة فيه، ما يقابله في الآيلتس والتوفل، نقاط ضعفك بالموضوع، وخطة أسبوعين.</p>
      <Btn primary onClick={start} disabled={busy}>ابدأ</Btn>
      {data?.history?.length > 0 && <div style={{ color: C.muted, fontSize: T.sm }}>آخر نتيجة: {data.history[0].result?.level || "—"} في {num(new Date(data.history[0].finishedAt).toLocaleDateString("ar"))}</div>}
    </div>,
  );

  if (session.stage === "grammar" && session.item) return shell(
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ color: C.muted, fontSize: T.xs }}>قواعد ومفردات · السؤال {num(session.n)} · يتوقف حين يستقر مستواك، بين {num(session.min)} و{num(session.max)} سؤالاً</div>
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
