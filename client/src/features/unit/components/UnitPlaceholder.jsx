import { C } from "../../../shared/constants/theme";
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
    <div className="madar-in" style={{ paddingBottom: 40 }}>
      <TopBar title={info.domainName} onBack={onBack} />
      <div style={{ padding: "0 16px" }}>
        <Pill color={info.color}>{info.domain ? RING_NAMES[info.ring] : "المركز"}</Pill>
        <div style={{ fontSize: 22, fontWeight: 800, margin: "10px 0 14px", lineHeight: 1.4 }}>{info.title}</div>
        <Card style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>هذه الوحدة لم تُكتب بعد</div>
          <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.7 }}>
            في النموذج الأولي كُتبت وحدتان كاملتان: <b style={{ color: C.text }}>النوم</b> في مجال الإنسان، و<b style={{ color: C.text }}>كيف يتعلم دماغك</b> في المركز. يمكنك محاكاة إكمال هذه الوحدة لتجربة الخريطة والنقاط والدوري.
          </div>
        </Card>
        {PARTS.map(([h, p]) => (
          <div key={h} style={{ display: "flex", gap: 10, padding: "10px 4px", borderBottom: `1px dashed ${C.line}` }}>
            <div style={{ fontWeight: 800, minWidth: 62, color: info.color }}>{h}</div>
            <div style={{ color: C.muted, fontSize: 13 }}>{p}</div>
          </div>
        ))}
        <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
          <Btn primary color={info.color} onClick={onSimulate}>محاكاة الإكمال</Btn>
          <Btn ghost onClick={onBack}>عودة</Btn>
        </div>
      </div>
    </div>
  );
}
