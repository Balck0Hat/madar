import { C, T, S } from "../../../shared/constants/theme";
import { Btn, Card } from "../../../shared/components/ui";

const arDate = (d) => new Date(d).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" });

// شاشة ما قبل البدء: الشروط مكتوبة كاملة قبل أن يستهلك المتعلم محاولته الوحيدة
export default function ExamIntro({ status, num, err, busy, onBegin }) {
  const { certificate, eligible, reopensAt, size = 40, minutes = 45, cooldownDays = 30 } = status;
  if (certificate) {
    return (
      <Card>
        <div style={{ fontWeight: 700 }}>لديك شهادة إتمام بالفعل</div>
        <div style={{ color: C.muted, fontSize: T.base, marginTop: S.sm }}>الرمز {certificate.code}</div>
      </Card>
    );
  }
  const blocked = Boolean(reopensAt);
  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: T.x2 }}>{blocked ? "الامتحان مغلق مؤقتاً" : eligible ? "أنت جاهز" : "لم يُفتح بعد"}</div>
      <div style={{ color: C.muted, fontSize: T.md, lineHeight: 1.8, marginTop: S.md }}>
        {blocked
          ? `محاولة واحدة كل ${num(cooldownDays)} يوماً. تُفتح المحاولة القادمة في ${arDate(reopensAt)}.`
          : eligible
            ? `${num(size)} سؤالاً محجوزاً لم يظهر في تمارين الوحدات، في ${num(minutes)} دقيقة، بلا تغذية راجعة أثناء الامتحان. النجاح ثمانون بالمئة.`
            : "يُفتح الامتحان بعد إتمام وحدات المركز الثلاث والمجالات العشرة كلها."}
      </div>
      {!blocked && eligible && (
        <ul style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.9, margin: `${S.xl}px 0 0`, paddingInlineStart: S.x4 }}>
          <li>محاولة واحدة كل {num(cooldownDays)} يوماً، وتُحتسب من لحظة البدء.</li>
          <li>التسليم بعد انتهاء المهلة يُرفض ولا يُصحَّح.</li>
          <li>امتحان غير مراقَب: الشهادة شهادة إتمام لا شهادة خبرة.</li>
        </ul>
      )}
      {err && <div role="alert" style={{ color: C.red, fontSize: T.base, marginTop: S.lg }}>{err}</div>}
      <div style={{ marginTop: S.x3 }}><Btn primary disabled={!eligible || blocked || busy} onClick={onBegin}>{busy ? "لحظة..." : "ابدأ الامتحان"}</Btn></div>
    </Card>
  );
}
