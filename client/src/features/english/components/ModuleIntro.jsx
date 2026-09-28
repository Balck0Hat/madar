import { Clock, ListChecks, Headphones, BookOpenText, Info } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";

// مقدمة وحدة آيلتس/توفل: الوقت وعدد الأسئلة، الأقسام بعناوينها، وتنبيهات الامتحان واضحة قبل البدء
export default function ModuleIntro({ mod, onStart }) {
  const num = useNum();
  const listening = mod.skill === "listening";
  const total = mod.sections.reduce((n, s) => n + s.qs.length, 0);
  const Icon = listening ? Headphones : BookOpenText;
  const stat = (I, value, label) => (
    <div style={{ display: "grid", justifyItems: "center", gap: S.xs, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x2 }}>
      <I size={18} color={C.gold} aria-hidden="true" /><b className="madar-num" style={{ fontSize: T.x2 }}>{num(value)}</b><span style={{ color: C.muted, fontSize: T.xs }}>{label}</span>
    </div>
  );
  const tips = [
    "مؤقّت واحد للوحدة كلها كما في الامتحان الحقيقي، ويبدأ حين تضغط «ابدأ».",
    "أجب عن أسئلة كل قسم ثم سلّمه لترى التصحيح والشرح قبل الانتقال.",
    ...(listening ? ["الصوت يُشغَّل مرة، ويمكن إعادته مرة واحدة فقط. استعمل سماعات إن أمكن."] : ["اقرأ الأسئلة أولاً ثم ابحث عن الجواب في النص، لا العكس."]),
  ];
  return (
    <div style={{ display: "grid", gap: S.x3 }}>
      <h1 dir="ltr" style={{ fontSize: T.x4, fontWeight: 700, margin: 0, textAlign: "end" }}>{mod.title}</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: S.lg }}>
        {stat(Clock, mod.minutes, "دقيقة")}{stat(ListChecks, total, "سؤالاً")}{stat(Icon, mod.sections.length, "أقسام")}
      </div>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: S.md }}>
        {mod.sections.map((s, i) => (
          <li key={s.id} style={{ display: "flex", alignItems: "center", gap: S.lg, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.lg, padding: `${S.lg}px ${S.x2}px` }}>
            <span className="madar-num" style={{ width: 28, height: 28, borderRadius: R.pill, background: alpha(C.gold, 0.15), color: C.gold, fontWeight: 700, display: "grid", placeItems: "center", flexShrink: 0 }}>{num(i + 1)}</span>
            <span dir="ltr" style={{ flex: 1, minWidth: 0, textAlign: "end", fontWeight: 600 }}>{s.title}</span>
            <span className="madar-num" style={{ color: C.muted, fontSize: T.xs, flexShrink: 0 }}>{num(s.qs.length)} س</span>
          </li>
        ))}
      </ol>
      <div style={{ display: "grid", gap: S.md, background: alpha(C.gold, 0.08), borderRadius: R.x2, padding: S.x3 }}>
        {tips.map((t) => <div key={t} style={{ display: "flex", gap: S.md, alignItems: "flex-start", fontSize: T.sm, lineHeight: 1.7 }}><Info size={14} color={C.gold} aria-hidden="true" style={{ flexShrink: 0, marginTop: S.xs }} />{t}</div>)}
      </div>
      <Btn primary onClick={onStart}>ابدأ</Btn>
    </div>
  );
}
