import { useMemo, useState } from "react";
import { Shuffle, Eye, ArrowLeftRight } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn, EmptyState } from "../../../shared/components/ui";
import { getTechInterview } from "../services/tech.service";
import { metaOf, LEVELS, levelTone } from "./tech.meta";
import QuestionCard from "./QuestionCard";

// أسئلة مقابلة قسم كامل: تصفية بالمستوى، القائمة مجموعةً فموضوعاً بكشف الأجوبة، ووضع «اختبرني»
// يعرض سؤالاً عشوائياً (أو بالترتيب) لتجيب في رأسك ثم تكشف الجواب وتنتقل.
export default function InterviewScreen({ branchId, onBack, onTopic }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(() => getTechInterview(branchId), [branchId]);
  const [level, setLevel] = useState("all");
  const [quiz, setQuiz] = useState(null); // { order: [indexes], i, revealed }
  const { hue } = metaOf(branchId);
  const all = useMemo(() => (data?.groups || []).flatMap((g) => g.topics.flatMap((t) => t.questions.map((q) => ({ ...q, topic: t.title, topicId: t.id })))), [data]);
  const pool = all.filter((q) => level === "all" || q.level === level);
  const start = (shuffle) => { const order = pool.map((_, i) => i); if (shuffle) for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } setQuiz({ order, i: 0, revealed: false }); };

  const shell = (children) => (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x8 }}>
      <TopBar title={data ? `أسئلة المقابلة · ${data.branch.title}` : "أسئلة المقابلة"} onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={8} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);
  if (!all.length) return shell(<EmptyState title="لا أسئلة بعد" text="أسئلة هذا القسم تُكتب الآن." />);

  const chips = (
    <div style={{ display: "flex", gap: S.sm, overflowX: "auto", paddingBottom: S.xs }} aria-label="المستوى">
      {[["all", "الكل"], ...LEVELS].map(([k, l]) => <button key={k} type="button" aria-pressed={level === k} onClick={() => { setLevel(k); setQuiz(null); }} style={{ flexShrink: 0, minHeight: TAP, padding: `0 ${S.x3}px`, borderRadius: R.pill, border: `1px solid ${level === k ? (k === "all" ? C.gold : levelTone(k)) : C.line}`, background: level === k ? alpha(k === "all" ? C.gold : levelTone(k), 0.15) : C.surface, color: C.text, fontFamily: "inherit", fontSize: T.sm, fontWeight: 600, cursor: "pointer" }}>{l}</button>)}
    </div>
  );

  if (quiz) {
    const q = pool[quiz.order[quiz.i]];
    const last = quiz.i >= quiz.order.length - 1;
    return shell(
      <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: C.muted, fontSize: T.sm }}><span>اختبرني · {num(quiz.i + 1)} من {num(quiz.order.length)}</span><button type="button" onClick={() => setQuiz(null)} style={{ background: "transparent", border: 0, color: C.gold, fontFamily: "inherit", fontSize: T.sm, cursor: "pointer", minHeight: TAP }}>إنهاء</button></div>
        <div style={{ height: 4, borderRadius: R.pill, background: C.line }}><div style={{ width: `${((quiz.i + 1) / quiz.order.length) * 100}%`, height: "100%", borderRadius: R.pill, background: hue }} /></div>
        <div style={{ color: C.muted, fontSize: T.xs }}><button type="button" onClick={() => onTopic(q.topicId)} style={{ background: "transparent", border: 0, padding: 0, color: hue, fontFamily: "inherit", fontSize: T.xs, cursor: "pointer" }}>{q.topic}</button></div>
        <QuestionCard item={q} open={quiz.revealed} onToggle={() => setQuiz((s) => ({ ...s, revealed: !s.revealed }))} />
        <div style={{ display: "flex", gap: S.lg }}>
          {!quiz.revealed ? <Btn primary onClick={() => setQuiz((s) => ({ ...s, revealed: true }))}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}><Eye size={16} aria-hidden="true" />اكشف الجواب</span></Btn>
            : <Btn primary onClick={() => (last ? setQuiz(null) : setQuiz((s) => ({ ...s, i: s.i + 1, revealed: false })))}>{last ? "انتهى · عودة للقائمة" : "السؤال التالي"}</Btn>}
        </div>
      </>,
    );
  }
  return shell(
    <>
      <p style={{ margin: 0, color: C.muted, lineHeight: 1.8 }}>{num(pool.length)} سؤالاً{level === "all" ? "" : ` (${LEVELS.find(([k]) => k === level)?.[1]})`}. اقرأ السؤال وأجب في رأسك ثم اكشف الجواب النموذجي، أو ابدأ «اختبرني» لأسئلة عشوائية واحداً واحداً.</p>
      {chips}
      <div style={{ display: "flex", gap: S.lg }}>
        <Btn primary onClick={() => start(true)}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}><Shuffle size={16} aria-hidden="true" />اختبرني عشوائياً</span></Btn>
        <Btn paper full={false} onClick={() => start(false)}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}><ArrowLeftRight size={16} aria-hidden="true" />بالترتيب</span></Btn>
      </div>
      {data.groups.map((g) => {
        const topics = g.topics.map((t) => ({ ...t, questions: t.questions.filter((q) => level === "all" || q.level === level) })).filter((t) => t.questions.length);
        if (!topics.length) return null;
        return (
          <section key={g.id} aria-label={g.title} style={{ display: "grid", gap: S.lg }}>
            <h2 style={{ margin: 0, fontSize: T.lg, fontWeight: 700, color: hue }}>{g.title}</h2>
            {topics.map((t) => (
              <div key={t.id} style={{ display: "grid", gap: S.md }}>
                <button type="button" onClick={() => onTopic(t.id)} style={{ background: "transparent", border: 0, padding: 0, color: C.text, fontFamily: "inherit", fontWeight: 700, fontSize: T.base, textAlign: "start", cursor: "pointer", minHeight: TAP - 12 }}>{t.title} <span className="madar-num" style={{ color: C.muted, fontWeight: 400, fontSize: T.xs }}>{num(t.questions.length)}</span></button>
                {t.questions.map((q, i) => <QuestionCard key={i} item={q} index={i + 1} />)}
              </div>
            ))}
          </section>
        );
      })}
    </>,
  );
}
