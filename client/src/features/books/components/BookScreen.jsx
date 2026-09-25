import { Check, Circle } from "lucide-react";
import { C, R, S, T, TAP, alpha, READ } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import { getBook } from "../services/books.service";
import { useBookProgress } from "../hooks/useBookProgress";
import BookCover from "./BookCover";
import BookPrintButton from "./BookPrintButton";

// صفحة الكتاب: الغلاف والوعد والمقدمة، ثم الفهرس بعلامات المقروء، وزر «تابع»
export default function BookScreen({ bookId, onBack, onOpenChapter }) {
  const num = useNum();
  const { data: b, loading, error, reload } = useAsync(() => getBook(bookId), [bookId]);
  const progress = useBookProgress();
  if (loading) return <div className="madar-in madar-col"><TopBar title="الكتب" onBack={onBack} /><div style={{ padding: `0 ${S.x4}px` }}><Skeleton lines={6} /></div></div>;
  if (error || !b) return <div className="madar-in madar-col"><TopBar title="الكتب" onBack={onBack} /><div style={{ padding: `0 ${S.x4}px` }}><ErrorState message={error?.message || "الكتاب غير موجود"} onRetry={reload} onBack={onBack} /></div></div>;

  const color = b.cover?.color || C.gold;
  const done = progress.readCount(bookId);
  const next = b.toc.find((c) => !progress.isRead(bookId, c.order))?.order || b.toc[0]?.order || 1;
  const last = progress.last[bookId];
  const resume = last && !progress.isRead(bookId, last) ? last : next;
  return (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="الكتب" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>
        <div style={{ display: "flex", gap: S.x3, alignItems: "flex-start" }}>
          <BookCover book={b} width={96} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ fontSize: T.x4, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{b.title}</h1>
            <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs, lineHeight: 1.6 }}>{b.subtitle}</div>
            <div style={{ color: C.muted, fontSize: T.xs, marginTop: S.md }}>{num(b.chapters)} فصول · نحو {num(b.minutes)} دقيقة · {b.audience}</div>
          </div>
        </div>
        <p style={{ fontFamily: READ, fontSize: T.xl, lineHeight: 1.9, margin: 0, borderInlineStart: `3px solid ${color}`, paddingInlineStart: S.x3 }}>{b.tagline}</p>
        <Btn primary color={color} style={{ color: C.bg }} onClick={() => onOpenChapter(resume)}>{done === 0 ? "ابدأ الفصل الأول" : done === b.chapters ? "أعد القراءة من البداية" : `تابع: الفصل ${num(resume)}`}</Btn>
        {b.promise && <div style={{ background: alpha(color, 0.08), border: `1px solid ${alpha(color, 0.3)}`, borderRadius: R.x2, padding: S.x3, fontSize: T.sm, lineHeight: 1.8 }}><span style={{ fontWeight: 700 }}>ستخرج بـ: </span>{b.promise}</div>}
        {b.intro && <details><summary style={{ cursor: "pointer", fontWeight: 700, fontSize: T.sm, minHeight: TAP, display: "flex", alignItems: "center" }}>مقدمة الكتاب</summary><p style={{ fontFamily: READ, fontSize: T.lg, lineHeight: 1.9, color: C.text, marginTop: S.md }}>{b.intro}</p></details>}
        <div>
          <div style={{ fontWeight: 700, fontSize: T.sm, color: C.muted, margin: `${S.md}px 0 ${S.lg}px` }}>الفصول</div>
          <div style={{ display: "grid", gap: S.md }}>
            {b.toc.map((c) => {
              const read = progress.isRead(bookId, c.order);
              return (
                <button key={c.chapterId} type="button" onClick={() => onOpenChapter(c.order)} className="madar-press"
                  style={{ display: "flex", alignItems: "center", gap: S.x2, minHeight: TAP, textAlign: "start", fontFamily: "inherit", cursor: "pointer", color: C.text, background: C.surface, border: `1px solid ${read ? alpha(color, 0.5) : C.line}`, borderRadius: R.xl, padding: `${S.lg}px ${S.x2}px` }}>
                  {read ? <Check size={16} color={color} aria-hidden="true" /> : <Circle size={16} color={C.muted} aria-hidden="true" />}
                  <span style={{ color: C.muted, fontSize: T.xs, width: 22, textAlign: "center" }}>{num(c.order)}</span>
                  <span style={{ flex: 1, minWidth: 0, fontWeight: 600 }}>{c.title}</span>
                  <span style={{ color: C.muted, fontSize: T.xs }}>{num(c.minutes)} د</span>
                </button>
              );
            })}
          </div>
        </div>
        <BookPrintButton bookId={bookId} />
        {b.sources?.length > 0 && <div style={{ color: C.muted, fontSize: T.xs, lineHeight: 1.8 }}><div style={{ fontWeight: 700 }}>بُني على</div>{b.sources.map((s, i) => <div key={i}>· {s}</div>)}</div>}
      </div>
    </div>
  );
}
