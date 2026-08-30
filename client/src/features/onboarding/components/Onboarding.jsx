import { useState } from "react";
import { C, MONO, alpha, T, R, S, GUTTER } from "../../../shared/constants/theme";
import { DOMAINS } from "../../../shared/data/domains";
import { Btn, Card } from "../../../shared/components/ui";
import { Icon } from "../../../shared/components/icons/Icon";

const TITLES = ["كم دقيقة يومياً؟", "ما الذي يشدّك أكثر؟"];
const SUBS = ["الوتيرة تحدد موعد إنجازك، ويمكنك تغييرها لاحقاً.", "سنبدأ خريطتك من هنا بعد وحدات المركز."];
const PACES = [[15, "خفيفة", "وحدة كل 3 أيام"], [30, "متوازنة", "وحدة كل يومين"], [60, "جادّة", "وحدة كل يوم"]];

// بعد إنشاء الحساب: الوتيرة والمجال المفضل
export default function Onboarding({ name, onDone }) {
  const [step, setStep] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [fav, setFav] = useState("human");
  const [busy, setBusy] = useState(false);
  const finish = async () => { setBusy(true); try { await onDone({ minutes, fav }); } finally { setBusy(false); } };
  return (
    <div className="madar-in" style={{ minHeight: "100vh", padding: `${S.x6}px ${GUTTER}px ${S.x7}px`, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: S.md, marginBottom: S.x6 }}>{[0, 1].map((i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: R.pill, background: i <= step ? C.gold : C.line }} />)}</div>
      {step === 0 && <div style={{ color: C.gold, fontWeight: 600, marginBottom: S.md }}>أهلاً {name}</div>}
      <div style={{ fontSize: T.x5, fontWeight: 700 }}>{TITLES[step]}</div>
      <div style={{ color: C.muted, marginTop: S.md, marginBottom: S.x5 }}>{SUBS[step]}</div>
      {step === 0 && (
        <div style={{ display: "grid", gap: S.xl }}>
          {PACES.map(([m, l, d]) => (
            <Card key={m} onClick={() => setMinutes(m)} accent={minutes === m ? C.gold : null} style={{ borderColor: minutes === m ? C.gold : C.line }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontWeight: 700 }}>{l}</div><div style={{ color: C.muted, fontSize: T.base }}>{d}</div></div>
                <div style={{ fontFamily: MONO, fontWeight: 600, color: C.gold, fontSize: T.x2 }}>{m} د</div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {step === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.xl }}>
          {DOMAINS.map((d) => (
            <button key={d.id} type="button" onClick={() => setFav(d.id)} aria-pressed={fav === d.id} style={{ background: fav === d.id ? alpha(d.color, 0.15) : C.surface, border: `1px solid ${fav === d.id ? d.color : C.line}`, borderRadius: R.x2, padding: `${S.x3}px ${S.x2}px`, color: C.text, textAlign: "start", cursor: "pointer" }}>
              <Icon id={d.id} size={20} color={d.color} />
              <div style={{ fontWeight: 700, marginTop: S.lg }}>{d.name}</div>
              <div style={{ color: C.muted, fontSize: T.xs, marginTop: S.xs, lineHeight: 1.5 }}>{d.desc}</div>
            </button>
          ))}
        </div>
      )}
      <div style={{ flex: 1 }} />
      <div style={{ marginTop: S.x6 }}>
        <Btn primary disabled={busy} onClick={() => (step < 1 ? setStep(1) : finish())}>{step < 1 ? "التالي" : busy ? "لحظة..." : "افتح الخريطة"}</Btn>
      </div>
    </div>
  );
}
