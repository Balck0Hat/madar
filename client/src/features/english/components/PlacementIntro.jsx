import { BookA, BookOpenText, Headphones, PenLine, Clock, Target } from "lucide-react";
import { C, R, S, T, HUE, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";

const PARTS = [
  { Icon: BookA, title: "قواعد ومفردات", sub: "12 إلى 24 سؤالاً تتكيّف مع إجاباتك", min: 12, hue: HUE.violet },
  { Icon: BookOpenText, title: "قراءة", sub: "مقطعان بأسئلة على نمط الآيلتس", min: 14, hue: HUE.blue },
  { Icon: Headphones, title: "استماع", sub: "مقطعان بلكنات بريطانية وأمريكية", min: 10, hue: HUE.teal },
  { Icon: PenLine, title: "كتابة", sub: "اختيارية، يصحّحها نموذج لغوي", min: 5, hue: HUE.orange },
];

// مقدمة اختبار تحديد المستوى: الأجزاء الأربعة كبطاقات بوقت كل جزء، وما تحصل عليه في النهاية
export default function PlacementIntro({ onStart, busy, last }) {
  const num = useNum();
  return (
    <div style={{ display: "grid", gap: S.x3 }}>
      <h1 style={{ fontSize: T.x4, fontWeight: 700, margin: 0 }}>اختبار تحديد المستوى</h1>
      <div style={{ display: "flex", alignItems: "center", gap: S.md, color: C.muted, fontSize: T.sm }}><Clock size={14} aria-hidden="true" />نحو 30 دقيقة · أربعة أجزاء بمؤقّت</div>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: S.lg }}>
        {PARTS.map(({ Icon, title, sub, min, hue }, i) => (
          <li key={title} style={{ display: "flex", gap: S.lg, alignItems: "flex-start", background: C.surface, border: `1px solid ${C.line}`, borderInlineStart: `3px solid ${hue}`, borderRadius: R.x2, padding: S.x2 }}>
            <span style={{ width: 36, height: 36, borderRadius: R.lg, background: alpha(hue, 0.15), display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={18} color={hue} aria-hidden="true" /></span>
            <span style={{ display: "grid", gap: S.xs }}>
              <b style={{ fontSize: T.md }}><span className="madar-num" style={{ color: C.muted, fontWeight: 400 }}>{num(i + 1)}.</span> {title}</b>
              <span style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.6 }}>{sub}</span>
              <span className="madar-num" style={{ color: hue, fontSize: T.xs, fontWeight: 600 }}>نحو {num(min)} دقيقة</span>
            </span>
          </li>
        ))}
      </ol>
      <div style={{ display: "flex", gap: S.lg, alignItems: "flex-start", background: alpha(C.gold, 0.08), borderRadius: R.x2, padding: S.x2, fontSize: T.sm, lineHeight: 1.8 }}>
        <Target size={16} color={C.gold} aria-hidden="true" style={{ flexShrink: 0, marginTop: S.xs }} />
        <span>في النهاية: مستواك ومدى الثقة فيه، ما يقابله في الآيلتس والتوفل، نقاط ضعفك بالموضوع، وخطة أسبوعين.</span>
      </div>
      <Btn primary onClick={onStart} disabled={busy}>ابدأ الاختبار</Btn>
      {last && <div style={{ color: C.muted, fontSize: T.sm }}>آخر نتيجة: {last.result?.level || "—"} في {num(new Date(last.finishedAt).toLocaleDateString("ar"))}</div>}
    </div>
  );
}
