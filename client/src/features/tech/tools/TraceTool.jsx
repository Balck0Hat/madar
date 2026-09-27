import { useState } from "react";
import { C, S, T } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { getTrace } from "../services/tech.service";
import { HostForm, Box, Bar, Note, toneForMs } from "./toolUi";

// أداة تتبّع المسار: القفزات بين خادم مدار والوجهة، كل راوتر في الطريق وزمنه
export default function TraceTool({ hue = C.gold }) {
  const num = useNum();
  const [state, setState] = useState({ busy: false, data: null, error: null });
  const run = async (name) => {
    setState({ busy: true, data: null, error: null });
    try { setState({ busy: false, data: await getTrace(name), error: null }); } catch (err) { setState({ busy: false, data: null, error: err.message }); }
  };
  const d = state.data;
  const max = d ? Math.max(50, ...d.hops.map((h) => h.ms || 0)) : 1;
  return (
    <div style={{ display: "grid", gap: S.x2 }}>
      <Note>كل سطر راوتر مرّت به الرزمة في طريقها من خادم مدار إلى الوجهة. الزمن يتراكم مع البعد، والراوتر الذي «لا يجيب» موجود لكنه يرفض الكشف عن نفسه.</Note>
      <HostForm label="الوجهة" placeholder="example.com أو 1.1.1.1" initial="1.1.1.1" busy={state.busy} onSubmit={run} hue={hue} action="تتبّع" />
      {state.busy && <Note>يتتبّع… قد يستغرق حتى 25 ثانية.</Note>}
      {state.error && <Box tone={C.red}>{state.error}</Box>}
      {d && (
        <Box tone={d.reached ? C.green : C.gold}>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: S.md }}>
            {d.hops.map((h) => (
              <li key={h.hop} style={{ display: "grid", gridTemplateColumns: "2ch 1fr", gap: S.lg, alignItems: "center" }}>
                <span className="madar-num" style={{ color: C.muted, fontSize: T.sm }}>{num(h.hop)}</span>
                <div style={{ display: "grid", gap: S.xs }}>
                  <span dir="ltr" className="madar-num" style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: T.sm, textAlign: "start", color: h.ip ? C.text : C.muted }}>{h.ip || "* * *  لا يجيب"}</span>
                  {h.ip && <Bar value={h.ms} max={max} tone={h.loss ? C.red : toneForMs(h.ms)} label={`${num(h.ms)} ms`} />}
                </div>
              </li>
            ))}
          </ol>
          <Note>{d.reached ? `وصلت الرزمة في ${num(d.hops.length)} قفزة.` : "لم تصل الرزمة إلى الوجهة نفسها؛ قد يكون الخادم يحجب التتبّع أو الطريق أطول من 20 قفزة."} العناوين 10.x و192.168.x في البداية شبكة داخلية عند المستضيف.</Note>
        </Box>
      )}
    </div>
  );
}
