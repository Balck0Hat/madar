import { useEffect } from "react";
import { Clock, Check, ListChecks } from "lucide-react";
import { C, P, R, S, T, TAP, alpha, READ } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import CheckIn from "../../../shared/components/ui/CheckIn";
import { getChapter } from "../services/books.service";
import { useBookProgress } from "../hooks/useBookProgress";
import ChapterSection, { body } from "./ChapterSection";

// فصل يُقرأ بالتمرير على ورق القراءة: افتتاحية، أقسام بالتظليل، تمرين اليوم،
// ثلاث خلاصات، سؤال اختياري، ثم «أنهيت الفصل» يعلّمه مقروءاً ويفتح التالي.
export default function ChapterScreen({ bookId, n, onBack, onOpenChapter }) {
  const num = useNum();
  const progress = useBookProgress();
  const { data: c, loading, error, reload } = useAsync(() => getChapter(bookId, n), [bookId, n]);
  const color = c?.color || P.gold;
  useEffect(() => { if (c) { progress.setLast(bookId, Number(n)); window.scrollTo?.(0, 0); } }, [c]); // eslint-disable-line react-hooks/exhaustive-deps

  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.ink, "--unit-color": color, backgroundImage: `radial-gradient(140% 60% at 50% 0%, ${alpha(color, 0.07)}, transparent 60%)` }}>
      <TopBar paper title={<span style={{ fontSize: T.lg }}>{c?.bookTitle || "الكتب"}</span>} onBack={onBack} />
      <div className="madar-read" style={{ padding: `${S.lg}px ${S.x5}px ${S.x9}px` }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton paper lines={8} />);
  if (error || !c) return shell(<ErrorState message={error?.message || "الفصل غير موجود"} onRetry={reload} onBack={onBack} />);

  const read = progress.isRead(bookId, Number(n));
  const hasNext = Number(n) < c.total;
  const noteId = `book:${bookId}:${n}`;
  const finish = () => { progress.markRead(bookId, Number(n)); if (hasNext) onOpenChapter(Number(n) + 1); else onBack(); };
  const check = c.check ? { t: "mcq", ...c.check } : null;
  return shell(
    <>
      <div style={{ color, fontSize: ".78em", fontWeight: 700 }}>الفصل {num(n)} من {num(c.total)}</div>
      <h1 style={{ fontSize: "1.8em", fontWeight: 700, margin: `${S.sm}px 0 ${S.md}px`, lineHeight: 1.3 }}>{c.title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: S.md, color: P.muted, fontSize: ".8em" }}><Clock size={13} aria-hidden="true" />نحو {num(c.minutes)} دقائق{read && <span style={{ color: C.green, display: "inline-flex", alignItems: "center", gap: S.xs, marginInlineStart: S.md }}><Check size={13} aria-hidden="true" />قرأته</span>}</div>
      {c.hook && <p style={{ ...body, fontSize: "1.14em", margin: `${S.x4}px 0 0`, borderInlineStart: `3px solid ${color}`, paddingInlineStart: S.x3 }}>{c.hook}</p>}
      {(c.sections || []).map((s, i) => <ChapterSection key={i} noteId={noteId} index={i} heading={s.h} text={s.p} color={color} />)}
      {c.exercise && (
        <div style={{ marginTop: S.x5, background: alpha(color, 0.08), border: `1px solid ${alpha(color, 0.35)}`, borderRadius: R.x3, padding: S.x4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: S.md, fontWeight: 700 }}><ListChecks size={18} color={color} aria-hidden="true" />{c.exercise.title || "تمرين اليوم"}{c.exercise.minutes ? <span style={{ color: P.muted, fontWeight: 400, fontSize: ".85em" }}> · {num(c.exercise.minutes)} دقيقة</span> : null}</div>
          <ol style={{ margin: `${S.x2}px 0 0`, paddingInlineStart: S.x5, display: "grid", gap: S.lg, fontFamily: READ, fontSize: "1.02em", lineHeight: 1.8 }}>
            {c.exercise.steps.map((st, i) => <li key={i}>{st}</li>)}
          </ol>
        </div>
      )}
      {c.takeaways?.length > 0 && (
        <div style={{ marginTop: S.x4 }}>
          <div style={{ fontWeight: 700, marginBottom: S.lg }}>الخلاصة</div>
          <div style={{ display: "grid", gap: S.lg }}>{c.takeaways.map((t, i) => <div key={i} style={{ ...body, fontSize: ".98em", display: "flex", gap: S.xl }}><Check size={16} color={color} style={{ flexShrink: 0, marginTop: S.sm }} aria-hidden="true" />{t}</div>)}</div>
        </div>
      )}
      <CheckIn question={check} color={color} />
      <div style={{ display: "flex", gap: S.lg, marginTop: S.x5 }}>
        {Number(n) > 1 && <Btn ghost paper full={false} small onClick={() => onOpenChapter(Number(n) - 1)}>السابق</Btn>}
        <Btn primary color={color} style={{ color: P.bg, minHeight: TAP }} onClick={finish}>{hasNext ? "أنهيت الفصل · التالي" : "أنهيت الكتاب"}</Btn>
      </div>
    </>,
  );
}
