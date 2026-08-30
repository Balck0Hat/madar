import { C, T, S } from "../../../shared/constants/theme";
import { RING_NAMES } from "../../../shared/data/curriculum";
import { Btn, Card, Pill, TopBar } from "../../../shared/components/ui";

const PARTS = [
  ["الشرارة", "سؤال أو حقيقة مدهشة تفتح الوحدة"],
  ["الدرس", "6 إلى 12 بطاقة، كل بطاقة تحت 120 كلمة مع رسمة"],
  ["جرّب", "تمرين تفاعلي قصير"],
  ["الخيط", "سؤال يربط هذه الوحدة بمجال آخر"],
  ["الاختبار", "10 أسئلة من بنك 30"],
];

// وحدة لم يُكتب محتواها بعد: تعرض هيكل الوحدة وتتيح محاكاة الإكمال
export default function UnitPlaceholder({ info, onBack, onSimulate }) {
  return (
    <div className="madar-in" style={{ paddingBottom: S.x8 }}>
      <TopBar title={info.domainName} onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px` }}>
        <Pill color={info.color}>{info.domain ? RING_NAMES[info.ring] : "المركز"}</Pill>
        <div style={{ fontSize: T.x4, fontWeight: 700, margin: `${S.xl}px 0 ${S.x3}px`, lineHeight: 1.4 }}>{info.title}</div>
        <Card style={{ marginBottom: S.xl }}>
          <div style={{ fontWeight: 700, marginBottom: S.md }}>هذه الوحدة لم تُكتب بعد</div>
          <div style={{ color: C.muted, fontSize: T.md, lineHeight: 1.7 }}>
            في النموذج الأولي كُتبت وحدتان كاملتان: <b style={{ color: C.text }}>النوم</b> في مجال الإنسان، و<b style={{ color: C.text }}>كيف يتعلم دماغك</b> في المركز. يمكنك محاكاة إكمال هذه الوحدة لتجربة الخريطة والنقاط والدوري.
          </div>
        </Card>
        {PARTS.map(([h, p]) => (
          <div key={h} style={{ display: "flex", gap: S.xl, padding: `${S.xl}px ${S.sm}px`, borderBottom: `1px dashed ${C.line}` }}>
            <div style={{ fontWeight: 700, minWidth: 62, color: info.color }}>{h}</div>
            <div style={{ color: C.muted, fontSize: T.base }}>{p}</div>
          </div>
        ))}
        <div style={{ display: "grid", gap: S.lg, marginTop: S.x4 }}>
          <Btn primary color={info.color} onClick={onSimulate}>محاكاة الإكمال</Btn>
          <Btn ghost onClick={onBack}>عودة</Btn>
        </div>
      </div>
    </div>
  );
}
