import { useState } from "react";
import { C, inputStyle, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { Btn } from "../../../shared/components/ui";

const KINDS = [["sura", "سور", 114], ["juz", "أجزاء", 30], ["page", "صفحات", 604]];

// اختيار الهدف: سورة أو أكثر، أو جزء، أو صفحات من مصحف المدينة، وجرعة يومية.
// الافتراضي: جزء عمّ بثلاث آيات في اليوم.
export default function GoalPicker({ suras = [], goal, onSave, onCancel }) {
  const [kind, setKind] = useState(goal?.kind || "juz");
  const [from, setFrom] = useState(goal?.from || 30);
  const [to, setTo] = useState(goal?.to || 30);
  const [perDay, setPerDay] = useState(goal?.perDay || 3);
  const max = KINDS.find((k) => k[0] === kind)[2];
  const pick = (k) => { setKind(k); const d = k === "juz" ? 30 : k === "sura" ? 114 : 582; setFrom(d); setTo(k === "page" ? 604 : d); };
  const clamp = (v) => Math.max(1, Math.min(max, Number(v) || 1));
  const valid = to >= from;

  const Range = ({ value, onChange, label }) => (
    <label style={{ display: "grid", gap: S.xs, flex: 1 }}>
      <span style={{ fontSize: T.xs, color: C.muted }}>{label}</span>
      {kind === "sura" ? (
        <select value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ ...inputStyle, minHeight: TAP }}>
          {suras.map((s) => <option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
        </select>
      ) : <input type="number" min={1} max={max} value={value} onChange={(e) => onChange(clamp(e.target.value))} style={{ ...inputStyle, minHeight: TAP }} />}
    </label>
  );

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x4, display: "grid", gap: S.x3, boxShadow: "var(--shadow-1)" }}>
      <div style={{ fontWeight: 700, fontSize: T.lg }}>ماذا تحفظ؟</div>
      <div style={{ display: "flex", gap: S.md }}>
        {KINDS.map(([k, label]) => (
          <button key={k} type="button" onClick={() => pick(k)} aria-pressed={kind === k}
            style={{ flex: 1, minHeight: TAP, fontFamily: "inherit", fontSize: T.sm, fontWeight: 700, borderRadius: R.pill, cursor: "pointer", background: kind === k ? alpha(C.gold, 0.16) : C.surface2, color: kind === k ? C.gold : C.muted, border: `1px solid ${kind === k ? C.gold : C.line}` }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: S.lg }}>
        <Range value={from} onChange={(v) => { setFrom(v); if (to < v) setTo(v); }} label="من" />
        <Range value={to} onChange={setTo} label="إلى" />
      </div>
      <label style={{ display: "grid", gap: S.xs }}>
        <span style={{ fontSize: T.xs, color: C.muted }}>آيات جديدة في اليوم</span>
        <input type="number" min={1} max={30} value={perDay} onChange={(e) => setPerDay(Math.max(1, Math.min(30, Number(e.target.value) || 1)))} style={{ ...inputStyle, minHeight: TAP }} />
      </label>
      <div style={{ display: "flex", gap: S.lg }}>
        <Btn primary disabled={!valid} onClick={() => onSave({ kind, from, to, perDay })}>احفظ الهدف</Btn>
        {onCancel && <Btn paper full={false} onClick={onCancel}>إلغاء</Btn>}
      </div>
    </div>
  );
}
