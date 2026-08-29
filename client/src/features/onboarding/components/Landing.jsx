import { C } from "../../../shared/constants/theme";
import { Btn, OrbitMark } from "../../../shared/components/ui";

export default function Landing({ onStart, onLogin, googleUrl }) {
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
        {googleUrl && <a href={googleUrl} style={{ display: "block", textAlign: "center", background: C.surface2, color: C.text, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 18px", fontWeight: 700, textDecoration: "none", minHeight: 44 }}>المتابعة بحساب Google</a>}
        <Btn onClick={onLogin}>لديّ حساب</Btn>
        <div style={{ color: C.muted, fontSize: 12, textAlign: "center", marginTop: 4 }}>يُحفظ تقدمك على حسابك وتعود إليه من أي جهاز.</div>
      </div>
    </div>
  );
}
