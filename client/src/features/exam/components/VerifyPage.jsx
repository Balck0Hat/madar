import { ShieldCheck, ShieldX } from "lucide-react";
import { C, MONO, T } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Btn, Card, OrbitMark, Skeleton, ErrorState } from "../../../shared/components/ui";
import { verifyCertificate } from "../services/exam.service";

// صفحة عامة: التحقق من شهادة برمزها (/verify/:code).
// التحقق يجيب عن سؤال واحد: هل أصدرت مدار هذه الورقة؟ ولذلك نذكر هنا حدود ما تشهد به،
// كي لا يقرأها صاحب عمل أو جهة قبول على أنها شهادة كفاءة أو تأهيل.
export default function VerifyPage({ code, onHome }) {
  const { data, loading, error, reload } = useAsync(() => verifyCertificate(code), [code]);
  const valid = data?.valid;
  return (
    <div className="madar-in" style={{ minHeight: "100vh", padding: "40px 22px", display: "grid", alignContent: "start", gap: 16 }}>
      <OrbitMark size={72} />
      <div style={{ textAlign: "center", fontWeight: 900, fontSize: T.x4 }}>التحقق من شهادة إتمام</div>
      <div style={{ textAlign: "center", fontFamily: MONO, color: C.muted }}>{code}</div>
      {loading && <Skeleton lines={3} />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && (
        <Card accent={valid ? C.green : C.red}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: T.x2, color: valid ? C.green : C.red }}>
            {valid ? <ShieldCheck size={22} /> : <ShieldX size={22} />}{valid ? "شهادة إتمام مسجّلة لدى مدار" : "لا توجد شهادة بهذا الرمز"}
          </div>
          {valid && (
            <div style={{ marginTop: 10, lineHeight: 1.9, fontSize: T.lg }}>
              <div><span style={{ color: C.muted }}>الاسم:</span> <b>{data.name}</b></div>
              <div><span style={{ color: C.muted }}>التاريخ:</span> {new Date(data.issuedAt).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" })}</div>
              <div><span style={{ color: C.muted }}>النتيجة:</span> <span style={{ fontFamily: MONO }}>{data.score}/{data.total}</span></div>
              <div style={{ color: C.muted, fontSize: T.base, marginTop: 8, lineHeight: 1.8 }}>
                تشهد بأن صاحبها أتمّ وحدات المدار الأول الثلاث والثمانين، واجتاز امتحان إتمام من أربعين سؤالاً بنسبة ثمانين بالمئة فأعلى.
              </div>
              <div style={{ color: C.muted, fontSize: T.base, lineHeight: 1.8 }}>
                الامتحان <b style={{ color: C.text }}>غير مراقَب</b>: يؤدّى عن بُعد بلا مراقبة هوية أو شاشة. هذه شهادة إتمام دراسة، وليست شهادة خبرة أو تأهيل مهني.
              </div>
            </div>
          )}
        </Card>
      )}
      <Btn onClick={onHome}>إلى مدار</Btn>
    </div>
  );
}
