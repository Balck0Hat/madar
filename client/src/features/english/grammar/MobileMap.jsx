import { useState } from "react";
import { ChevronDown, Heart, Check } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { hueOf } from "./mapLayout";

// خريطة الهاتف: الفروع على مسار متعرّج، فتح فرع يعرض مجموعاته وموضوعاته كرقاقات تحته
export default function MobileMap({ branches, dimmed, selected, onSelect, openBranch, onOpenBranch }) {
  const num = useNum();
  const [open, setOpen] = useState(openBranch || null);
  const toggle = (id) => { const next = open === id ? null : id; setOpen(next); onOpenBranch?.(next); };
  return (
    <div style={{ position: "relative", display: "grid", gap: S.x2 }}>
      <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M 50 0 L 50 100" style={{ stroke: alpha(C.gold, 0.35) }} strokeWidth={0.6} strokeDasharray="1.5 1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div style={{ justifySelf: "center", width: 96, height: 96, borderRadius: R.pill, border: `4px solid ${C.gold}`, background: C.surface, display: "grid", placeItems: "center", textAlign: "center", fontWeight: 700, fontSize: T.sm, boxShadow: `0 0 0 8px ${alpha(C.gold, 0.15)}`, position: "relative" }}>قواعد الإنجليزية</div>
      {branches.map((b, i) => {
        const hue = hueOf(b.hue);
        const count = b.groups.reduce((n, g) => n + g.topics.length, 0);
        const isOpen = open === b.id;
        return (
          <div key={b.id} style={{ position: "relative", display: "grid", gap: S.lg, justifyItems: i % 2 ? "end" : "start" }}>
            <button type="button" onClick={() => toggle(b.id)} aria-expanded={isOpen} aria-controls={`branch-${b.id}`}
              style={{ minHeight: TAP, padding: `${S.lg}px ${S.x4}px`, borderRadius: R.pill, border: `2px solid ${hue}`, background: isOpen ? hue : alpha(hue, 0.18), color: isOpen ? C.bg : C.text, fontFamily: "inherit", fontWeight: 700, fontSize: T.lg, display: "inline-flex", alignItems: "center", gap: S.md, cursor: "pointer", boxShadow: `0 6px 16px ${alpha(hue, 0.35)}`, marginInline: i % 2 ? 0 : S.x4 }}>
              {b.title}<span className="madar-num" style={{ fontSize: T.xs, opacity: 0.85 }}>{num(count)}</span><ChevronDown size={16} aria-hidden="true" style={{ transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform .2s" }} />
            </button>
            {isOpen && (
              <div id={`branch-${b.id}`} className="madar-rise" style={{ width: "100%", background: C.surface, border: `1px solid ${alpha(hue, 0.5)}`, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.x2 }}>
                {b.groups.map((g) => (
                  <div key={g.id} style={{ display: "grid", gap: S.md }}>
                    <div style={{ fontWeight: 700, fontSize: T.sm, color: hue }}>{g.title}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: S.sm }}>
                      {g.topics.map((t) => (
                        <button key={t.id} type="button" onClick={() => onSelect(t.id)} aria-pressed={selected === t.id} aria-label={`${t.title}${t.level ? ` · ${t.level}` : ""}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: S.sm, minHeight: TAP, padding: `0 ${S.x2}px`, borderRadius: R.pill, border: `1.5px solid ${selected === t.id ? C.gold : alpha(hue, 0.6)}`, background: selected === t.id ? alpha(C.gold, 0.2) : C.surface2, color: C.text, fontFamily: "inherit", fontSize: T.sm, cursor: "pointer", opacity: dimmed(t) ? 0.35 : 1 }}>
                          {t.mastery !== null && t.mastery >= 75 && <Check size={12} color={C.green} strokeWidth={3} aria-hidden="true" />}
                          {t.marked && <Heart size={12} color={C.red} fill={C.red} aria-hidden="true" />}
                          {t.title}{t.level && <span className="madar-num" style={{ fontSize: 10, color: C.muted }}>{t.level}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
