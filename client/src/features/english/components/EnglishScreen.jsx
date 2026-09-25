import { Gauge, GraduationCap, Lock } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, Card } from "../../../shared/components/ui";
import { getPlacement } from "../services/english.service";

const TRACKS = [
  { id: "general", title: "الإنجليزية العامة", text: "قواعد ومفردات يومية حتى B1، لمن يريد أساساً قبل الامتحانات." },
  { id: "ielts", title: "آيلتس IELTS", text: "قراءة واستماع بتصحيح آلي، كتابة بتصحيح النموذج، ومحادثة بالتسجيل." },
  { id: "toefl", title: "توفل TOEFL", text: "الشكل الأمريكي: أسئلة متكاملة وتوقيت الامتحان." },
];

// بوابة الإنجليزية: تحديد المستوى أولاً، ثم المسارات. المسارات تُبنى تباعاً.
export default function EnglishScreen({ onBack, onPlacement }) {
  const num = useNum();
  const { data, loading } = useAsync(() => getPlacement().catch(() => null), []);
  const last = data?.history?.[0]?.result;
  return (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="اللغات · الإنجليزية" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>
        {loading ? <Skeleton lines={3} /> : (
          <Card accent={C.gold} onClick={onPlacement} style={{ display: "flex", gap: S.x2, alignItems: "center" }}>
            <Gauge size={26} color={C.gold} aria-hidden="true" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: T.lg }}>{last ? `مستواك: ${last.level} · آيلتس نحو ${num(last.ielts)}` : "ابدأ باختبار تحديد المستوى"}</div>
              <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs }}>{last ? last.recommendation?.text : "25 دقيقة: قواعد ومفردات تكيّفية، قراءة، استماع، وكتابة قصيرة. يقول لك من أين تبدأ."}</div>
            </div>
          </Card>
        )}
        <div style={{ fontWeight: 700, fontSize: T.sm, color: C.muted, marginTop: S.md }}>المسارات</div>
        {TRACKS.map((t) => (
          <div key={t.id} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x4, display: "flex", gap: S.x2, alignItems: "center", opacity: 0.75 }}>
            <GraduationCap size={22} color={C.muted} aria-hidden="true" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{t.title}</div>
              <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs, lineHeight: 1.6 }}>{t.text}</div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: S.xs, fontSize: T.xs, color: C.muted, background: alpha(C.gold, 0.1), borderRadius: R.pill, padding: `${S.xs}px ${S.x2}px` }}><Lock size={12} aria-hidden="true" />قريباً</span>
          </div>
        ))}
      </div>
    </div>
  );
}
