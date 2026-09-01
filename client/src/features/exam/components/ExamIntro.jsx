import { C, T, S } from "../../../shared/constants/theme";
import { Btn, Card } from "../../../shared/components/ui";

const arDate = (d) => new Date(d).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" });

// شاشة ما قبل البدء: الشروط مكتوبة كاملة قبل أن يستهلك المتعلم محاولته
export default function ExamIntro({ status, num, err, busy, onBegin }) {
  const { certificate, eligible, reopensAt, resumable, size = 40, minutes = 45, cooldownDays = 30 } = status;

  // محاولة معلّقة تُستأنف بلا استهلاك محاولة جديدة ولا إعادة سحب الأسئلة
  if (resumable) {
    return (
      <Card accent={C.gold}>
        <div style={{ fontWeight: 700, fontSize: T.x2 }}>لديك امتحان لم يكتمل</div>
        <div style={{ color: C.muted, fontSize: T.md, lineHeight: 1.8, marginTop: S.md }}>
          أجبت عن {num(resumable.answered)} من {num(size)}. الأسئلة والوقت محفوظان، وينتهي في {new Date(resumable.endsAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}.
        </div>
        {err && <div role="alert" style={{ color: C.red, fontSize: T.base, marginTop: S.lg }}>{err}</div>}
        <div style={{ marginTop: S.x3 }}><Btn primary disabled={busy} onClick={onBegin}>{busy ? "لحظة..." : "تابع الامتحان"}</Btn></div>
      </Card>
    );
  }

  const perfect = certificate && certificate.score === certificate.total;
  const blocked = Boolean(reopensAt);
  return (
    <Card>
      {certificate && (
        <div style={{ color: C.muted, fontSize: T.base, marginBottom: S.x2, lineHeight: 1.8 }}>
          لديك شهادة إتمام بالرمز {certificate.code} بعلامة {num(certificate.score)}/{num(certificate.total)}.
          {!perfect && " يمكنك إعادة الامتحان لتحسينها؛ الرمز نفسه يبقى."}
        </div>
      )}
      <div style={{ fontWeight: 700, fontSize: T.x2 }}>
        {perfect ? "أتممت الامتحان بعلامة كاملة" : blocked ? "الامتحان مغلق مؤقتاً" : eligible ? "أنت جاهز" : "لم يُفتح بعد"}
      </div>
      <div style={{ color: C.muted, fontSize: T.md, lineHeight: 1.8, marginTop: S.md }}>
        {perfect
          ? "لا شيء بعدها تحسّنه."
          : blocked
            ? `محاولة واحدة كل ${num(cooldownDays)} يوماً. تُفتح المحاولة القادمة في ${arDate(reopensAt)}.`
            : eligible
              ? `${num(size)} سؤالاً محجوزاً لم يظهر في تمارين الوحدات، موزّعة على المجالات كلها، في ${num(minutes)} دقيقة. النجاح ثمانون بالمئة.`
              : "يُفتح الامتحان بعد إتمام وحدات المركز الثلاث والمجالات العشرة كلها."}
      </div>
      {!blocked && !perfect && eligible && (
        <ul style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.9, margin: `${S.xl}px 0 0`, paddingInlineStart: S.x4 }}>
          <li>محاولة واحدة كل {num(cooldownDays)} يوماً، وتُحتسب من لحظة البدء.</li>
          <li>كل إجابة تُحفظ فور إعطائها، فلو انقطع الاتصال تابعت من حيث وقفت.</li>
          <li>التنقّل حرّ: تترك سؤالاً وتعود إليه، وتراجع الكل قبل التسليم.</li>
          <li>عند انتهاء المهلة يُسلَّم الامتحان تلقائياً ويُصحَّح ما أجبت عنه.</li>
          <li>امتحان غير مراقَب: الشهادة شهادة إتمام لا شهادة خبرة.</li>
        </ul>
      )}
      {err && <div role="alert" style={{ color: C.red, fontSize: T.base, marginTop: S.lg }}>{err}</div>}
      <div style={{ marginTop: S.x3 }}>
        <Btn primary disabled={!eligible || blocked || perfect || busy} onClick={onBegin}>
          {busy ? "لحظة..." : certificate ? "أعد الامتحان" : "ابدأ الامتحان"}
        </Btn>
      </div>
    </Card>
  );
}
