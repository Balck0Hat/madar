import { C } from "../../../shared/constants/theme";
import { Btn, Card } from "../../../shared/components/ui";

const arDate = (d) => new Date(d).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" });

// شاشة ما قبل البدء: الشروط مكتوبة كاملة قبل أن يستهلك المتعلم محاولته الوحيدة
export default function ExamIntro({ status, num, err, busy, onBegin }) {
  const { certificate, eligible, reopensAt, size = 40, minutes = 45, cooldownDays = 30 } = status;
  if (certificate) {
    return (
      <Card>
        <div style={{ fontWeight: 800 }}>لديك شهادة إتمام بالفعل</div>
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>الرمز {certificate.code}</div>
      </Card>
    );
  }
  const blocked = Boolean(reopensAt);
  return (
    <Card>
      <div style={{ fontWeight: 800, fontSize: 18 }}>{blocked ? "الامتحان مغلق مؤقتاً" : eligible ? "أنت جاهز" : "لم يُفتح بعد"}</div>
      <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.8, marginTop: 6 }}>
        {blocked
          ? `محاولة واحدة كل ${num(cooldownDays)} يوماً. تُفتح المحاولة القادمة في ${arDate(reopensAt)}.`
          : eligible
            ? `${num(size)} سؤالاً محجوزاً لم يظهر في تمارين الوحدات، في ${num(minutes)} دقيقة، بلا تغذية راجعة أثناء الامتحان. النجاح ثمانون بالمئة.`
            : "يُفتح الامتحان بعد إتمام وحدات المركز الثلاث والمجالات العشرة كلها."}
      </div>
      {!blocked && eligible && (
        <ul style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.9, margin: "10px 0 0", paddingInlineStart: 18 }}>
          <li>محاولة واحدة كل {num(cooldownDays)} يوماً، وتُحتسب من لحظة البدء.</li>
          <li>التسليم بعد انتهاء المهلة يُرفض ولا يُصحَّح.</li>
          <li>امتحان غير مراقَب: الشهادة شهادة إتمام لا شهادة خبرة.</li>
        </ul>
      )}
      {err && <div role="alert" style={{ color: C.red, fontSize: 13, marginTop: 8 }}>{err}</div>}
      <div style={{ marginTop: 14 }}><Btn primary disabled={!eligible || blocked || busy} onClick={onBegin}>{busy ? "لحظة..." : "ابدأ الامتحان"}</Btn></div>
    </Card>
  );
}
