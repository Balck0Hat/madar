import { useState } from "react";
import { C, inputStyle, alpha, T, R } from "../../../shared/constants/theme";
import { Btn, TopBar } from "../../../shared/components/ui";
import { register, login } from "../services/auth.service";

const FIELD_LABEL = { name: "الاسم", email: "البريد الإلكتروني", password: "كلمة المرور" };

function Field({ id, label, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", fontSize: T.base, fontWeight: 700, marginBottom: 6 }}>{label}</label>
      <input id={id} aria-describedby={error ? `${id}-err` : undefined} aria-invalid={!!error} style={{ ...inputStyle, borderColor: error ? C.red : C.line }} {...props} />
      {error && <div id={`${id}-err`} style={{ color: C.red, fontSize: T.sm, marginTop: 6 }}>{error}</div>}
    </div>
  );
}

// تسجيل حساب جديد أو تسجيل الدخول بالبريد وكلمة المرور
export default function AuthScreen({ mode: initialMode = "register", canRegister = true, onBack, onAuthed }) {
  const [mode, setMode] = useState(canRegister ? initialMode : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [topError, setTopError] = useState("");
  const isRegister = canRegister && mode === "register";
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (isRegister && !form.name.trim()) errs.name = "الاسم مطلوب";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = "بريد غير صالح";
    if (isRegister && !(form.password.length >= 8 && /[A-Za-z]/.test(form.password) && /\d/.test(form.password))) errs.password = "8 أحرف على الأقل، فيها حرف ورقم";
    if (!isRegister && !form.password) errs.password = "كلمة المرور مطلوبة";
    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setTopError("");
    try {
      const payload = { email: form.email.trim(), password: form.password, ...(isRegister ? { name: form.name.trim() } : {}) };
      const user = isRegister ? await register(payload) : await login(payload);
      onAuthed(user, isRegister);
    } catch (err) {
      if (err.details) setErrors(Object.fromEntries(Object.entries(err.details).map(([k, v]) => [k, `${FIELD_LABEL[k] || k}: ${v[0]}`])));
      else setTopError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="madar-in" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar title={isRegister ? "حساب جديد" : "تسجيل الدخول"} onBack={onBack} />
      <form onSubmit={submit} noValidate style={{ padding: "8px 22px 32px", display: "grid", gap: 14, flex: 1, alignContent: "start" }}>
        <div style={{ color: C.muted, fontSize: T.md, lineHeight: 1.7 }}>{isRegister ? "يُحفظ تقدمك على حسابك وتعود إليه من أي جهاز." : canRegister ? "أهلاً بعودتك." : "التسجيل مغلق حالياً، والدخول متاح لأصحاب الحسابات."}</div>
        {isRegister && <Field id="name" label="الاسم" value={form.name} onChange={set("name")} onBlur={() => setErrors((x) => ({ ...x, ...(form.name.trim() ? { name: undefined } : {}) }))} error={errors.name} autoComplete="name" autoFocus />}
        <Field id="email" label="البريد الإلكتروني" type="email" dir="ltr" value={form.email} onChange={set("email")} error={errors.email} autoComplete="email" autoFocus={!isRegister} />
        <Field id="password" label="كلمة المرور" type="password" dir="ltr" value={form.password} onChange={set("password")} error={errors.password} autoComplete={isRegister ? "new-password" : "current-password"} />
        {topError && <div role="alert" style={{ background: alpha(C.red, 0.12), border: `1px solid ${alpha(C.red, 0.4)}`, borderRadius: R.lg, padding: "10px 12px", fontSize: T.base }}>{topError}</div>}
        <Btn primary disabled={busy} onClick={submit}>{busy ? "لحظة..." : isRegister ? "أنشئ الحساب" : "ادخل"}</Btn>
        {canRegister && (
          <Btn ghost onClick={() => { setMode(isRegister ? "login" : "register"); setErrors({}); setTopError(""); }}>
            {isRegister ? "لديّ حساب، أريد الدخول" : "ليس لديّ حساب"}
          </Btn>
        )}
      </form>
    </div>
  );
}
