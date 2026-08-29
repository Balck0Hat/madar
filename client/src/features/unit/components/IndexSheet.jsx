import { useEffect, useRef } from "react";
import { P, MONO, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

// فهرس الدرس: لوح ينزلق من الأسفل بعناوين الأقسام.
// لماذا Escape في مرحلة الالتقاط مع preventDefault: UnitScreen يستمع لـ Escape
// ليخرج من الوحدة، ولا يصح أن يُخرج القارئ من الدرس وهو يقصد إغلاق الفهرس فقط.
export default function IndexSheet({ titles, current, onPick, onClose }) {
  const num = useNum();
  const box = useRef(null);

  useEffect(() => {
    box.current?.focus?.();
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div role="presentation" onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 40, background: alpha("#000", 0.5), display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div ref={box} tabIndex={-1} role="dialog" aria-modal="true" aria-label="فهرس الدرس" className="madar-rise"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 430, maxHeight: "72vh", overflowY: "auto", background: P.bg, color: P.ink, border: `1px solid ${P.line}`, borderRadius: "20px 20px 0 0", padding: "14px 14px 22px", outline: "none" }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: P.line, margin: "0 auto 12px" }} aria-hidden="true" />
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>فهرس الدرس</div>
        <div style={{ display: "grid", gap: 4 }}>
          {titles.map((title, i) => {
            const on = i === current;
            return (
              <button key={i} type="button" onClick={() => onPick(i)} aria-current={on ? "true" : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: 10, textAlign: "start", cursor: "pointer",
                  minHeight: 44, padding: "8px 10px", borderRadius: 12, fontFamily: "inherit", fontSize: 14,
                  background: on ? alpha(P.gold, 0.16) : "transparent",
                  border: `1px solid ${on ? alpha(P.gold, 0.55) : "transparent"}`,
                  color: P.ink, fontWeight: on ? 800 : 500,
                }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: on ? P.gold : P.muted, minWidth: 18 }}>{num(i + 1)}</span>
                <span style={{ flex: 1, lineHeight: 1.5 }}>{title}</span>
                {on && <span style={{ fontSize: 11, color: P.gold, fontWeight: 800 }}>هنا</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
