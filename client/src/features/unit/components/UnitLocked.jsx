import { Lock } from "lucide-react";
import { P, READ, alpha, T, R } from "../../../shared/constants/theme";
import { Btn, TopBar } from "../../../shared/components/ui";
import Art from "../../../shared/components/art/Art";

const body = { fontFamily: READ, fontSize: "1.07em", lineHeight: 1.95 };

// معاينة وحدة مقفلة: الخادم يعيد الشرارة وبطاقة واحدة بلا أسئلة (unit.locked).
// نعرض ما وصل كما هو ونقول سبب التوقف صراحةً؛ لا شريط تقدّم ولا أدوات قراءة
// ولا زر اختبار، لأن أياً منها لا معنى له هنا وكلّها يوهم بأن الدرس متاح.
export default function UnitLocked({ info, content, onBack }) {
  const card = (content?.cards || [])[0];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: P.bg, color: P.ink, backgroundImage: `radial-gradient(140% 60% at 50% 0%, ${alpha(info.color, 0.07)}, transparent 60%)` }}>
      <TopBar paper onBack={onBack}
        title={<span style={{ fontSize: T.lg }}>{info.domainName} <span style={{ color: P.muted, fontWeight: 400 }}>· معاينة</span></span>} />
      <div className="madar-read madar-in" style={{ flex: 1, padding: "8px 20px 10px" }}>
        <div style={{ fontSize: "1.44em", fontWeight: 800, margin: "10px 0 14px", lineHeight: 1.4 }}>{content?.title || info.title}</div>
        {content?.spark && (
          <div style={{ ...body, fontSize: "1.1em", borderInlineStart: `3px solid ${info.color}`, paddingInlineStart: 14 }}>{content.spark}</div>
        )}
        {card && (
          <div style={{ marginTop: 26 }}>
            {card.art && <Art k={card.art} color={info.color} />}
            <div style={{ color: info.color, fontSize: ".75em", fontWeight: 700, marginTop: 14 }}>البطاقة الأولى</div>
            <div style={{ fontSize: "1.38em", fontWeight: 800, margin: "4px 0 10px", lineHeight: 1.4 }}>{card.h}</div>
            <div style={body}>{card.p}</div>
          </div>
        )}
        <div role="note" style={{ marginTop: 26, display: "flex", gap: 12, alignItems: "flex-start", background: P.card, border: `1px solid ${P.line}`, borderRadius: R.x3, padding: "14px 16px" }}>
          <span style={{ width: 34, height: 34, borderRadius: R.pill, flexShrink: 0, display: "grid", placeItems: "center", background: alpha(P.gold, 0.16), color: P.gold }}>
            <Lock size={17} aria-hidden="true" />
          </span>
          <div>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>هذه الوحدة مقفلة</div>
            <div style={{ color: P.muted, fontSize: ".88em", lineHeight: 1.8 }}>أكمل المدار السابق في هذا المجال لفتح هذه الوحدة</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "8px 16px 22px" }}>
        <Btn paper onClick={onBack}>عودة</Btn>
      </div>
    </div>
  );
}
