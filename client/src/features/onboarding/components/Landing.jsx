import { C, T, R, S, GUTTER } from "../../../shared/constants/theme";
import { Btn, OrbitMark } from "../../../shared/components/ui";

export default function Landing({ onStart, onLogin, googleUrl, canRegister = true }) {
  return (
    <div className="madar-in" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: `${S.x9}px ${GUTTER}px ${S.x7}px` }}>
      <div />
      <div style={{ textAlign: "center" }}>
        <OrbitMark />
        <h1 style={{ fontSize: T.display, fontWeight: 700, lineHeight: 1, color: C.text, margin: 0 }}>مدار</h1>
        <div style={{ color: C.gold, fontSize: T.x3, fontWeight: 600, marginTop: S.x2 }}>افهم كل شيء. خطوة خطوة.</div>
        <div style={{ color: C.muted, marginTop: S.x3, fontSize: T.lg, lineHeight: 1.8 }}>خريطة واحدة لكل المعرفة: 10 مجالات، 3 مدارات، 243 وحدة. بساعة يومياً تصل إلى شهادة إتمام المدار الأول.</div>
      </div>
      <div style={{ display: "grid", gap: S.xl, marginTop: S.x7 }}>
        {canRegister
          ? <Btn primary onClick={onStart}>ابدأ الرحلة</Btn>
          : <Btn primary onClick={onLogin}>ادخل إلى حسابك</Btn>}
        {googleUrl && <a href={googleUrl} style={{ display: "block", textAlign: "center", background: C.surface2, color: C.text, border: `1px solid ${C.line}`, borderRadius: R.xl, padding: `${S.x3}px ${S.x4}px`, fontWeight: 600, textDecoration: "none", minHeight: 44 }}>المتابعة بحساب Google</a>}
        {canRegister && <Btn onClick={onLogin}>لديّ حساب</Btn>}
        <div style={{ color: C.muted, fontSize: T.sm, textAlign: "center", marginTop: S.sm }}>
          {canRegister ? "يُحفظ تقدمك على حسابك وتعود إليه من أي جهاز." : "التسجيل مغلق حالياً. الدخول متاح لأصحاب الحسابات."}
        </div>
      </div>
    </div>
  );
}
