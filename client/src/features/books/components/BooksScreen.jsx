import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Card } from "../../../shared/components/ui";
import { listBooks } from "../services/books.service";
import { useBookProgress } from "../hooks/useBookProgress";
import BookCover from "./BookCover";

// رفّ الكتب: كل كتاب بغلافه وسطره ومدة قراءته وتقدّمك فيه
export default function BooksScreen({ onBack, onOpen }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(() => listBooks(), []);
  const progress = useBookProgress();
  return (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="الكتب" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x2 }}>
        <p style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.8, margin: 0 }}>كتب قصيرة تُقرأ فصلاً فصلاً، في كل فصل تمرين ينفَّذ اليوم. تُحفظ فصولك المقروءة وتظليلاتك على حسابك.</p>
        {loading && <Skeleton lines={5} />}
        {error && <ErrorState message={error.message} onRetry={reload} onBack={onBack} />}
        {(data || []).map((b) => {
          const done = progress.readCount(b.bookId);
          const color = b.cover?.color || C.gold;
          return (
            <Card key={b.bookId} accent={color} onClick={() => onOpen(b.bookId)} style={{ display: "flex", gap: S.x3, alignItems: "flex-start" }}>
              <BookCover book={b} width={64} />
              <div style={{ minWidth: 0, flex: 1, display: "grid", gap: S.sm }}>
                <div style={{ fontWeight: 700, fontSize: T.x2, lineHeight: 1.35 }}>{b.title}</div>
                <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.6 }}>{b.subtitle}</div>
                <div style={{ color: C.muted, fontSize: T.xs }}>{num(b.chapters)} فصول · نحو {num(b.minutes)} دقيقة قراءة</div>
                <div style={{ height: 5, background: C.surface2, borderRadius: R.pill, overflow: "hidden" }}>
                  <div style={{ width: `${b.chapters ? (done / b.chapters) * 100 : 0}%`, height: "100%", background: color }} />
                </div>
                <div style={{ color: done ? color : C.muted, fontSize: T.xs, fontWeight: done ? 700 : 400 }}>{done ? (done === b.chapters ? "أنهيته" : `قرأت ${num(done)} من ${num(b.chapters)}`) : "لم تبدأه بعد"}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
