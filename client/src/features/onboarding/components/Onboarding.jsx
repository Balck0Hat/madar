import { useState } from "react";
import { C, MONO } from "../../../shared/constants/theme";
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
    <div className="madar-in" style={{ minHeight: "100vh", padding: "28px 22px 32px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>{[0, 1].map((i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? C.gold : C.line }} />)}</div>
      {step === 0 && <div style={{ color: C.gold, fontWeight: 700, marginBottom: 6 }}>أهلاً {name}</div>}
      <div style={{ fontSize: 26, fontWeight: 800 }}>{TITLES[step]}</div>
      <div style={{ color: C.muted, marginTop: 6, marginBottom: 22 }}>{SUBS[step]}</div>
      {step === 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          {PACES.map(([m, l, d]) => (
            <Card key={m} onClick={() => setMinutes(m)} accent={minutes === m ? C.gold : null} style={{ borderColor: minutes === m ? C.gold : C.line }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontWeight: 800 }}>{l}</div><div style={{ color: C.muted, fontSize: 13 }}>{d}</div></div>
                <div style={{ fontFamily: MONO, fontWeight: 700, color: C.gold, fontSize: 18 }}>{m} د</div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {step === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {DOMAINS.map((d) => (
            <button key={d.id} type="button" onClick={() => setFav(d.id)} aria-pressed={fav === d.id} style={{ background: fav === d.id ? d.color + "26" : C.surface, border: `1px solid ${fav === d.id ? d.color : C.line}`, borderRadius: 16, padding: "14px 12px", color: C.text, textAlign: "start", cursor: "pointer" }}>
              <Icon id={d.id} size={20} color={d.color} />
              <div style={{ fontWeight: 800, marginTop: 8 }}>{d.name}</div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 2, lineHeight: 1.5 }}>{d.desc}</div>
            </button>
          ))}
        </div>
      )}
      <div style={{ flex: 1 }} />
      <div style={{ marginTop: 24 }}>
        <Btn primary disabled={busy} onClick={() => (step < 1 ? setStep(1) : finish())}>{step < 1 ? "التالي" : busy ? "لحظة..." : "افتح الخريطة"}</Btn>
      </div>
    </div>
  );
}
