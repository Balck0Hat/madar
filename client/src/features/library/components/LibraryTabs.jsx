import { C, FONT, alpha } from "../../../shared/constants/theme";

// تبويبان لعرضين لنفس المحتوى (ما درسته): الخلاصات المكتوبة، وما ظلّلته بنفسك
export default function LibraryTabs({ tab, onTab, tabs }) {
  return (
    <div role="tablist" aria-label="أقسام المكتبة" style={{ display: "flex", gap: 6, padding: "0 16px 12px" }}>
      {tabs.map((t) => {
        const on = t.id === tab;
        return (
          <button
            key={t.id} type="button" role="tab" aria-selected={on} onClick={() => onTab(t.id)}
            style={{
              flex: 1, minHeight: 40, borderRadius: 12, cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 14,
              background: on ? alpha(C.gold, 0.14) : C.surface,
              color: on ? C.gold : C.muted,
              border: `1px solid ${on ? alpha(C.gold, 0.4) : C.line}`,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
