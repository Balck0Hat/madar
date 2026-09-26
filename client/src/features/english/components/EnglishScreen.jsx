import { Gauge, GraduationCap, Target, SlidersHorizontal, ChevronLeft } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, Card, ErrorState } from "../../../shared/components/ui";
import { getPlacement, getTracks } from "../services/english.service";

const tone = (p) => (p >= 80 ? C.green : p < 60 ? C.red : C.gold);

// بوابة الإنجليزية: تحديد المستوى، ثم تدريب نقاط الضعف من آخر نتيجة، ثم المسارات الثلاثة، ولوحة المعايرة للمشرف
export default function EnglishScreen({ onBack, onPlacement, onTrack, onWeak, onAdmin, isAdmin = false }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(() => Promise.all([getPlacement().catch(() => null), getTracks()]), []);
  const [pl, tr] = data || [];
  const last = pl?.history?.[0]?.result;
  const weak = tr?.weak || [];
  const recommended = tr?.placement?.track?.replace("-plus", "") || null;
  return (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="اللغات · الإنجليزية" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>
        {loading ? <Skeleton lines={5} /> : error ? <ErrorState message={error.message} onRetry={reload} onBack={onBack} /> : (
          <>
            <Card accent={C.gold} onClick={onPlacement} style={{ display: "flex", gap: S.x2, alignItems: "center" }}>
              <Gauge size={26} color={C.gold} aria-hidden="true" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: T.lg }}>{last ? `مستواك: ${last.range?.[0] !== last.range?.[1] && last.range?.length === 2 ? `${last.range[0]}–${last.range[1]}` : last.level} · آيلتس نحو ${num(last.ielts)}` : "ابدأ باختبار تحديد المستوى"}</div>
                <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs }}>{last ? last.recommendation?.text : "30 دقيقة: قواعد ومفردات تكيّفية، قراءة، استماع، وكتابة قصيرة. يقول لك من أين تبدأ."}</div>
              </div>
            </Card>
            {weak.length > 0 && (
              <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x4, display: "grid", gap: S.lg }}>
                <div style={{ display: "flex", alignItems: "center", gap: S.md, fontWeight: 700 }}><Target size={18} color={C.red} aria-hidden="true" />تدرّب على نقاط ضعفك</div>
                {weak.map((w) => (
                  <button key={w.tag} type="button" onClick={() => onWeak(w.tag)} className="madar-press" style={{ display: "flex", alignItems: "center", gap: S.lg, width: "100%", textAlign: "start", background: "transparent", border: `1px solid ${C.line}`, borderRadius: R.xl, padding: `${S.lg}px ${S.x2}px`, color: C.text, fontFamily: "inherit", cursor: "pointer" }}>
                    <span style={{ flex: 1, minWidth: 0 }}>{w.label}</span>
                    <span className="madar-num" style={{ fontSize: T.xs, color: tone(w.history.at(-1)?.pct ?? w.rate) }}>{w.history.length ? `آخر تمرين ${num(w.history.at(-1).pct)}٪` : `${num(w.rate)}٪ في الاختبار`}</span>
                    <ChevronLeft size={16} color={C.muted} aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
            <div style={{ fontWeight: 700, fontSize: T.sm, color: C.muted, marginTop: S.md }}>المسارات</div>
            {tr?.tracks.map((t) => {
              const count = t.lessons ? `${num(t.lessons.length)} درساً` : `${num(t.modules.length)} وحدات · ${num(t.writing.length)} مهام كتابة`;
              return (
                <Card key={t.id} accent={recommended === t.id ? C.gold : undefined} onClick={() => onTrack(t.id)} style={{ display: "flex", gap: S.x2, alignItems: "center" }}>
                  <GraduationCap size={22} color={recommended === t.id ? C.gold : C.muted} aria-hidden="true" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{t.title}{recommended === t.id && <span style={{ fontSize: T.xs, color: C.gold, background: alpha(C.gold, 0.12), borderRadius: R.pill, padding: `${S.xs}px ${S.md}px`, marginInlineStart: S.md }}>مقترح لك</span>}</div>
                    <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs, lineHeight: 1.6 }}>{t.text}</div>
                    <div style={{ color: C.muted, fontSize: T.xs, marginTop: S.xs }}>{count}</div>
                  </div>
                </Card>
              );
            })}
            {isAdmin && (
              <button type="button" onClick={onAdmin} className="madar-press" style={{ display: "flex", alignItems: "center", gap: S.md, background: "transparent", border: `1px dashed ${C.line}`, borderRadius: R.xl, padding: S.x2, color: C.muted, fontFamily: "inherit", fontSize: T.sm, cursor: "pointer", marginTop: S.md }}>
                <SlidersHorizontal size={16} aria-hidden="true" />لوحة معايرة بنك الأسئلة (مشرف)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
