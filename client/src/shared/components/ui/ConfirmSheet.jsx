import { useEffect, useRef } from "react";
import { C, R, S, T, TAP, alpha } from "../../constants/theme";
import Btn from "./Btn";

// ورقة تأكيد من الأسفل بدل confirm() المتصفح: عنوان ونصّ وزرّان، Escape والنقر خارجها يلغيان،
// والتركيز يعود لما كان قبل الفتح.
export default function ConfirmSheet({ title, text, confirmLabel = "تأكيد", cancelLabel = "إلغاء", danger = false, onConfirm, onCancel }) {
  const box = useRef(null);
  useEffect(() => {
    const before = document.activeElement;
    box.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); onCancel(); } };
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("keydown", onKey, true); before?.focus?.(); };
  }, [onCancel]);
  return (
    <div role="presentation" onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 40, background: alpha("#000", 0.5), display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(2px)" }}>
      <div ref={box} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="madar-rise" onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, background: C.surface, color: C.text, borderRadius: `${R.x3}px ${R.x3}px 0 0`, padding: S.x4, display: "grid", gap: S.x3, boxShadow: "var(--shadow-3)", outline: "none" }}>
        <div id="confirm-title" style={{ fontWeight: 700, fontSize: T.x2 }}>{title}</div>
        {text && <div style={{ color: C.muted, lineHeight: 1.8, fontSize: T.base }}>{text}</div>}
        <div style={{ display: "flex", gap: S.lg }}>
          <Btn paper onClick={onCancel} style={{ minHeight: TAP }}>{cancelLabel}</Btn>
          <Btn primary onClick={onConfirm} style={{ minHeight: TAP, ...(danger ? { background: C.red } : {}) }}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}
