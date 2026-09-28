import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { TopBar } from "../../../shared/components/ui";
import { metaOf } from "../components/tech.meta";
import { empty, addDevice, removeDevice, moveDevice, togglePower, setIp, assign, toggleLink, route, conflicts, label } from "./lab.logic";
import { SCENARIOS, scenarioOf } from "./scenarios";
import LabCanvas from "./LabCanvas";
import { Palette, Inspector } from "./LabPanel";

const SPOTS = [[20, 70], [50, 70], [80, 70], [20, 30], [80, 30], [50, 30], [35, 50], [65, 50]];

// مختبر «ابنِ شبكتك»: أضف أجهزة، صِلها، أرسل رزماً وشاهد الطريق أو سبب الفشل؛ مع سيناريوهات لها هدف.
export default function NetworkLab({ onBack }) {
  const { hue } = metaOf("networks");
  const [scenarioId, setScenarioId] = useState("first");
  const [state, setState] = useState(() => scenarioOf("first").build());
  const [sel, setSel] = useState([]);
  const [mode, setMode] = useState("link");
  const [msg, setMsg] = useState(null);
  const [packet, setPacket] = useState(null);
  const scenario = scenarioId === "free" ? null : scenarioOf(scenarioId);
  const solved = scenario ? scenario.check(state) : false;
  const dupes = useMemo(() => conflicts(state), [state]);

  const load = (id) => { setScenarioId(id); setState(id === "free" ? empty() : scenarioOf(id).build()); setSel([]); setPacket(null); setMsg(null); };
  const add = (kind) => { const spot = SPOTS[state.devices.length % SPOTS.length]; const next = addDevice(state, kind, spot[0] + ((state.devices.length * 7) % 11) - 5, spot[1]); if (next === state) setMsg({ tone: C.gold, text: "إنترنت واحد يكفي." }); setState(next); };
  const tap = (id) => {
    if (!sel.length || sel[0] === id) { setSel(sel[0] === id ? [] : [id]); return; }
    if (mode === "link") { const r = toggleLink(state, sel[0], id); setState(r.state); setMsg(r.error ? { tone: C.red, text: r.error } : r.warn ? { tone: C.gold, text: r.warn } : null); setSel([]); return; }
    const r = route(state, sel[0], id);
    setPacket({ key: Date.now(), path: r.ok ? r.path : [sel[0]], ok: r.ok });
    setMsg(r.ok ? { tone: C.green, text: `وصلت الرزمة في ${r.hops} قفزة: ${r.path.map((p) => label(state.devices.find((d) => d.id === p))).join(" ← ")}` } : { tone: C.red, text: `لم تصل: ${r.reason}` });
    setSel([]);
  };
  const selected = state.devices.find((d) => d.id === sel[0]);
  const chip = (active) => ({ minHeight: TAP, padding: `0 ${S.x3}px`, borderRadius: R.pill, border: `1px solid ${active ? hue : C.line}`, background: active ? hue : C.surface, color: active ? C.bg : C.text, fontFamily: "inherit", fontWeight: 700, fontSize: T.sm, cursor: "pointer", whiteSpace: "nowrap" });

  return (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x8 }}>
      <TopBar title="ابنِ شبكتك" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: S.sm }} role="tablist" aria-label="السيناريو">
          {SCENARIOS.map((s) => <button key={s.id} type="button" role="tab" aria-selected={scenarioId === s.id} onClick={() => load(s.id)} style={chip(scenarioId === s.id)}>{s.title}</button>)}
          <button type="button" role="tab" aria-selected={scenarioId === "free"} onClick={() => load("free")} style={chip(scenarioId === "free")}>لوحة حرة</button>
        </div>
        {scenario && (
          <div style={{ display: "flex", gap: S.lg, alignItems: "flex-start", background: solved ? alpha(C.green, 0.1) : alpha(hue, 0.08), border: `1px solid ${solved ? C.green : alpha(hue, 0.3)}`, borderRadius: R.xl, padding: S.x3, lineHeight: 1.8 }} aria-live="polite">
            {solved && <CheckCircle2 size={20} color={C.green} aria-hidden="true" style={{ flexShrink: 0, marginTop: S.xs }} />}
            <div><b>{solved ? "أحسنت، تحقق الهدف. " : "الهدف: "}</b>{scenario.goal}</div>
            <button type="button" onClick={() => load(scenarioId)} aria-label="ابدأ من جديد" style={{ width: TAP, height: TAP, flexShrink: 0, borderRadius: R.pill, border: `1px solid ${C.line}`, background: C.surface, color: C.text, display: "grid", placeItems: "center", cursor: "pointer", marginInlineStart: "auto" }}><RotateCcw size={16} /></button>
          </div>
        )}
        <LabCanvas state={state} selected={sel} packet={packet} hue={hue} onTap={tap} onMove={(id, x, y) => setState((s) => moveDevice(s, id, x, y))} />
        {(msg || dupes.length > 0) && (
          <div role="status" style={{ display: "grid", gap: S.sm }}>
            {msg && <div style={{ background: alpha(msg.tone, 0.1), border: `1px solid ${alpha(msg.tone, 0.4)}`, borderRadius: R.lg, padding: `${S.lg}px ${S.x2}px`, lineHeight: 1.7, fontSize: T.md }}>{msg.text}</div>}
            {dupes.map((c) => <div key={c.ip} style={{ background: alpha(C.red, 0.08), border: `1px solid ${alpha(C.red, 0.4)}`, borderRadius: R.lg, padding: `${S.lg}px ${S.x2}px`, fontSize: T.sm }}>تعارض عناوين: <span dir="ltr" className="madar-num">{c.ip}</span> على {c.ids.length} أجهزة. الشبكة الحقيقية تعطّل أحدهما.</div>)}
          </div>
        )}
        <Palette hue={hue} onAdd={add} mode={mode} onMode={(m) => { setMode(m); setSel([]); }} />
        <Inspector device={selected} hue={hue} onPower={(id) => setState((s) => togglePower(s, id))} onRemove={(id) => { setState((s) => removeDevice(s, id)); setSel([]); }} onIp={(id, ip) => setState((s) => assign(setIp(s, id, ip)))} />
      </div>
    </div>
  );
}
