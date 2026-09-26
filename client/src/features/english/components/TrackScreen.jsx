import { BookOpenText, Headphones, PenLine, Check } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Card } from "../../../shared/components/ui";
import { getTracks } from "../services/english.service";

const ICON = { reading: BookOpenText, listening: Headphones, writing: PenLine };
const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

function Row({ icon: Icon, title, sub, right, onClick }) {
  return (
    <Card onClick={onClick} style={{ display: "flex", gap: S.x2, alignItems: "center" }}>
      <Icon size={22} color={C.gold} aria-hidden="true" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs, lineHeight: 1.6 }}>{sub}</div>
      </div>
      {right}
    </Card>
  );
}

// مسار: آيلتس/توفل (وحدات قراءة واستماع ومهام كتابة مع أفضل نتيجة) أو الإنجليزية العامة (دروس بحسب المستوى)
export default function TrackScreen({ track: trackId, onBack, onModule, onWriting, onLesson }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(() => getTracks(), [trackId]);
  const track = data?.tracks.find((t) => t.id === trackId);
  const shell = (children) => (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title={track?.title || "المسار"} onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={6} />);
  if (error || !track) return shell(<ErrorState message={error?.message || "المسار غير موجود"} onRetry={reload} onBack={onBack} />);
  const pill = (text, tone = C.gold) => <span className="madar-num" style={{ fontSize: T.xs, fontWeight: 700, color: tone, background: alpha(tone, 0.12), borderRadius: R.pill, padding: `${S.xs}px ${S.x2}px`, flexShrink: 0 }}>{text}</span>;

  if (trackId === "general") return shell(
    <>
      <p style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}>{track.text}</p>
      {LEVELS.map((lv) => {
        const ls = track.lessons.filter((l) => l.level === lv);
        return ls.length ? (
          <div key={lv} style={{ display: "grid", gap: S.lg }}>
            <div style={{ fontWeight: 700, fontSize: T.sm, color: C.muted }}>المستوى {lv}</div>
            {ls.map((l) => <Row key={l.tag} icon={BookOpenText} title={l.title} sub={`نحو ${num(l.minutes)} دقيقة · شرح وتمرين من 8 أسئلة`} onClick={() => onLesson(l.tag)}
              right={l.best ? pill(l.best.pct >= 75 ? <><Check size={12} aria-hidden="true" /> {num(l.best.pct)}٪</> : `${num(l.best.pct)}٪`, l.best.pct >= 75 ? C.green : C.gold) : null} />)}
          </div>
        ) : null;
      })}
    </>,
  );
  return shell(
    <>
      <p style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}>{track.text} المحادثة ستُضاف لاحقاً.</p>
      <div style={{ fontWeight: 700, fontSize: T.sm, color: C.muted }}>القراءة والاستماع</div>
      {track.modules.map((m) => <Row key={m.id} icon={ICON[m.skill]} title={m.title} sub={`${num(m.sections)} أقسام · ${num(m.questions)} سؤالاً · ${num(m.minutes)} دقيقة${m.attempts ? ` · ${num(m.attempts)} محاولة` : ""}`} onClick={() => onModule(m.id)}
        right={m.best ? pill(m.best.band ? `${num(m.best.band.value)}` : `${num(m.best.pct)}٪`) : null} />)}
      <div style={{ fontWeight: 700, fontSize: T.sm, color: C.muted, marginTop: S.md }}>الكتابة</div>
      {track.writing.map((w) => <Row key={w.id} icon={PenLine} title={w.title} sub={`${num(w.minutes)} دقيقة · ${num(w.words)} كلمة فأكثر · يصحّحها النموذج بمعايير الممتحن`} onClick={() => onWriting(w.id)}
        right={w.last ? pill(num(w.last.band)) : null} />)}
    </>,
  );
}
