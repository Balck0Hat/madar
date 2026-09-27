import { useEffect, useRef } from "react";
import { X, Heart, Check } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../../shared/constants/theme";
import { useNum } from "../../../../shared/context/PrefsContext";
import { hueOf } from "../mapLayout";

// ورقة جزيرة (للهاتف): اسم الفرع وصورته الصغيرة، ثم مجموعاته وقواعده كرقاقات كبيرة تُلمس بسهولة
export default function IslandSheet({ island, dimmed, selected, onSelect, onClose }) {
  const num = useNum();
  const box = useRef(null);
  const hue = hueOf(island.hue);
  const count = island.groups.reduce((n, g) => n + g.topics.length, 0);
  useEffect(() => {
    box.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); } };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);
  return (
    <div role="presentation" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: alpha("#000", 0.5), display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div ref={box} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`جزيرة ${island.title}`} className="madar-rise" onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 560, maxHeight: "82vh", overflowY: "auto", background: C.surface, color: C.text, borderRadius: `${R.x3}px ${R.x3}px 0 0`, padding: S.x4, display: "grid", gap: S.x3, boxShadow: "var(--shadow-3)", outline: "none", borderTop: `4px solid ${hue}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: S.x2 }}>
          <img src={`/maps/grammar/${island.id}.png`} alt="" width={64} height={64} style={{ width: 64, height: 64, objectFit: "contain", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: T.x2 }}>{island.title}</div>
            <div style={{ color: C.muted, fontSize: T.sm }}><span dir="ltr" style={{ fontFamily: "Georgia, serif" }}>{island.en}</span> · {num(count)} قاعدة</div>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق" style={{ width: TAP, height: TAP, borderRadius: R.pill, border: `1px solid ${C.line}`, background: "transparent", color: C.muted, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={18} /></button>
        </div>
        {island.groups.map((g) => (
          <div key={g.id} style={{ display: "grid", gap: S.md }}>
            <div style={{ fontWeight: 700, fontSize: T.sm, color: hue }}>{g.title}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: S.sm }}>
              {g.topics.map((t) => (
                <button key={t.id} type="button" onClick={() => onSelect(t.id)} aria-pressed={selected === t.id} aria-label={`${t.title}${t.level ? ` · ${t.level}` : ""}`}
                  style={{ display: "flex", alignItems: "center", gap: S.sm, minHeight: TAP, padding: `${S.sm}px ${S.x2}px`, borderRadius: R.lg, border: `1.5px solid ${selected === t.id ? C.gold : alpha(hue, 0.6)}`, background: selected === t.id ? alpha(C.gold, 0.2) : C.surface2, color: C.text, fontFamily: "inherit", fontSize: T.sm, fontWeight: 600, textAlign: "start", cursor: "pointer", opacity: dimmed(t) ? 0.35 : 1 }}>
                  {t.mastery !== null && t.mastery >= 75 && <Check size={12} color={C.green} strokeWidth={3} aria-hidden="true" />}
                  {t.marked && <Heart size={12} color={C.red} fill={C.red} aria-hidden="true" />}
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                  {t.level && <span className="madar-num" style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>{t.level}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
