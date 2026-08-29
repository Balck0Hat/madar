import { C } from "../../../shared/constants/theme";
import { Btn, OrbitMark } from "../../../shared/components/ui";

export default function Landing({ onStart }) {
  return (
    <div className="madar-in" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 24px 32px" }}>
      <div />
      <div style={{ textAlign: "center" }}>
        <OrbitMark />
        <h1 style={{ fontSize: 68, fontWeight: 900, lineHeight: 1, color: C.text, margin: 0 }}>مدار</h1>
        <div style={{ color: C.gold, fontSize: 20, fontWeight: 700, marginTop: 12 }}>افهم كل شيء. خطوة خطوة.</div>
        <div style={{ color: C.muted, marginTop: 14, fontSize: 15, lineHeight: 1.8 }}>خريطة واحدة لكل المعرفة: 10 مجالات، 3 مدارات، 243 وحدة. بساعة يومياً تصل إلى شهادة الثقافة العامة.</div>
      </div>
      <div style={{ display: "grid", gap: 10, marginTop: 32 }}>
        <Btn primary onClick={onStart}>ابدأ الرحلة</Btn>
        <Btn onClick={onStart}>المتابعة بحساب Google</Btn>
        <Btn onClick={onStart}>المتابعة بحساب Apple</Btn>
        <div style={{ color: C.muted, fontSize: 12, textAlign: "center", marginTop: 4 }}>نموذج أولي: التسجيل تجريبي ولا تُحفظ البيانات بعد إغلاق الصفحة.</div>
      </div>
    </div>
  );
}
