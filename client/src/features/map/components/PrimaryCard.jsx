import { Play, BookOpen, Clock } from "lucide-react";
import { C } from "../../../shared/constants/theme";
import { RING_NAMES, XP_LESSON, XP_QUIZ } from "../../../shared/data/curriculum";
import { useNum } from "../../../shared/context/NumContext";
import { Btn, Card, Pill } from "../../../shared/components/ui";

// الفعل الأوحد على الشاشة الأولى.
// كانت الخريطة تعرض ستة نداءات متنافسة (سلسلة، نقاط، رتبة، مراجعة، تحدٍّ، وحدة تالية)
// فلا يعرف المتعلّم أيّها المقصود. هنا نداء واحد: تابع ما بدأته، أو ابدأ التالي.
export default function PrimaryCard({ info, resuming = false, minutes, eta, onOpen }) {
  const num = useNum();

  if (!info) {
    return (
      <Card>
        <div style={{ fontWeight: 800 }}>أنهيت المدار الأول</div>
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4, lineHeight: 1.7 }}>
          امتحان المدار في صفحة «أنا»، والمدار الثاني يُفتح على العجلة.
        </div>
      </Card>
    );
  }

  const label = resuming ? "تابع القراءة" : "ابدأ الوحدة";
  const Ico = resuming ? BookOpen : Play;
  const xp = XP_LESSON[info.ring] + XP_QUIZ[info.ring];

  return (
    <Card accent={info.color}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <Pill color={info.color}>{info.domain ? `${info.domainName} · ${RING_NAMES[info.ring]}` : "المركز"}</Pill>
        <span style={{ color: C.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
          <Clock size={12} aria-hidden="true" />{num(info.minutes)} د · {num(xp)} XP
        </span>
      </div>

      <div style={{ fontWeight: 800, fontSize: 17, margin: "10px 0 4px", lineHeight: 1.5 }}>{info.title}</div>
      {/* سطر واحد يشرح لماذا هذه الوحدة بالذات، فالبطاقة الوحيدة يجب أن تبرّر نفسها */}
      <div style={{ color: C.muted, fontSize: 13, marginBottom: 12, lineHeight: 1.7 }}>
        {resuming ? "توقّفت هنا في آخر مرة." : "الخطوة التالية على مسارك."}
      </div>

      <span className="madar-press" style={{ display: "block" }}>
        <Btn primary onClick={onOpen}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Ico size={16} aria-hidden="true" />{label}</span>
        </Btn>
      </span>

      {/* وعد «تعلّم بوتيرتك» يعيش هنا هادئاً، بعيداً عن أي عدّاد ضغط */}
      {eta && (
        <div style={{ color: C.muted, fontSize: 12, marginTop: 10, textAlign: "center", lineHeight: 1.7 }}>
          بوتيرة {num(minutes)} دقيقة يومياً تكمل المدار الأول في {eta.label}
        </div>
      )}
    </Card>
  );
}
