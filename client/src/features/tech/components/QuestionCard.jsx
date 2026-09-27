import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { levelTone, LEVEL_LABEL } from "./tech.meta";

// سؤال مقابلة: السؤال ومستواه، تلميح اختياري، والجواب النموذجي يُكشف بالضغط
export default function QuestionCard({ item, index, open: forced, onToggle }) {
  const [local, setLocal] = useState(false);
  const open = forced ?? local;
  const toggle = () => (onToggle ? onToggle() : setLocal((v) => !v));
  const tone = levelTone(item.level);
  return (
    <div style={{ background: C.surface, border: `1px solid ${open ? alpha(tone, 0.6) : C.line}`, borderRadius: R.x2, overflow: "hidden" }}>
      <button type="button" onClick={toggle} aria-expanded={open} style={{ display: "flex", alignItems: "flex-start", gap: S.lg, width: "100%", minHeight: TAP, padding: `${S.lg}px ${S.x3}px`, background: "transparent", border: 0, color: C.text, fontFamily: "inherit", textAlign: "start", cursor: "pointer" }}>
        {index !== undefined && <span className="madar-num" style={{ color: C.muted, fontSize: T.sm, paddingTop: 2, flexShrink: 0 }}>{index}.</span>}
        <span style={{ flex: 1, minWidth: 0, fontWeight: 700, lineHeight: 1.6 }}>{item.q}</span>
        <span style={{ fontSize: T.xs, color: tone, background: alpha(tone, 0.12), borderRadius: R.pill, padding: `${S.xs}px ${S.lg}px`, flexShrink: 0 }}>{LEVEL_LABEL[item.level]}</span>
        <ChevronDown size={16} color={C.muted} aria-hidden="true" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : undefined, transition: "transform .2s" }} />
      </button>
      {open && (
        <div className="madar-rise" style={{ padding: `0 ${S.x3}px ${S.x3}px`, display: "grid", gap: S.md }}>
          {item.hint && <div style={{ display: "flex", gap: S.md, alignItems: "flex-start", color: C.muted, fontSize: T.sm, lineHeight: 1.7 }}><Lightbulb size={14} aria-hidden="true" style={{ marginTop: S.xs, flexShrink: 0 }} />{item.hint}</div>}
          <div style={{ lineHeight: 1.9, background: alpha(C.green, 0.08), borderInlineStart: `3px solid ${C.green}`, borderRadius: R.lg, padding: `${S.lg}px ${S.x2}px` }}>{item.a}</div>
        </div>
      )}
    </div>
  );
}
