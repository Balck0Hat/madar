import { useRef } from "react";
import { Search, X } from "lucide-react";
import { C, FONT, alpha } from "../../../shared/constants/theme";

// حقل البحث: تركيز تلقائي، مسح بالزر أو بمفتاح Escape، وبحث فوري بمفتاح Enter
export default function SearchInput({ value, onChange, onSubmit, onClear, onFocus, onBlur }) {
  const ref = useRef(null);

  const key = (e) => {
    if (e.key === "Enter") { e.preventDefault(); onSubmit(); }
    if (e.key === "Escape") { e.preventDefault(); onClear(); ref.current?.focus(); }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 14, padding: "0 12px", height: 48 }}>
      <Search size={18} color={C.muted} aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={key}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label="ابحث في الوحدات والخلاصات"
        placeholder="اكتب كلمة أو موضوعاً…"
        style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontFamily: FONT, fontSize: 16, minWidth: 0 }}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onClear(); ref.current?.focus(); }}
          aria-label="مسح البحث"
          style={{ background: alpha(C.muted, 0.16), border: "none", borderRadius: 999, width: 26, height: 26, display: "grid", placeItems: "center", color: C.text, cursor: "pointer", flexShrink: 0 }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
