import { useEffect, useRef } from "react";
import { P, MONO, alpha, T, R, S } from "../../../shared/constants/theme";
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
        style={{ width: "100%", maxWidth: 430, maxHeight: "72vh", overflowY: "auto", background: P.bg, color: P.ink, border: `1px solid ${P.line}`, borderRadius: "20px 20px 0 0", padding: `${S.x3}px ${S.x3}px ${S.x5}px`, outline: "none" }}>
        <div style={{ width: 40, height: 4, borderRadius: R.pill, background: P.line, margin: `0 auto ${S.x2}px` }} aria-hidden="true" />
        <div style={{ fontWeight: 700, fontSize: T.xl, marginBottom: S.xl }}>فهرس الدرس</div>
        <div style={{ display: "grid", gap: S.sm }}>
          {titles.map((title, i) => {
            const on = i === current;
            return (
              <button key={i} type="button" onClick={() => onPick(i)} aria-current={on ? "true" : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: S.xl, textAlign: "start", cursor: "pointer",
                  minHeight: 44, padding: `${S.lg}px ${S.xl}px`, borderRadius: R.lg, fontFamily: "inherit", fontSize: T.md,
                  background: on ? alpha(P.gold, 0.16) : "transparent",
                  border: `1px solid ${on ? alpha(P.gold, 0.55) : "transparent"}`,
                  color: P.ink, fontWeight: on ? 700 : 500,
                }}>
                <span style={{ fontFamily: MONO, fontSize: T.xs, color: on ? P.gold : P.muted, minWidth: 18 }}>{num(i + 1)}</span>
                <span style={{ flex: 1, lineHeight: 1.5 }}>{title}</span>
                {on && <span style={{ fontSize: T.xs, color: P.gold, fontWeight: 700 }}>هنا</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
