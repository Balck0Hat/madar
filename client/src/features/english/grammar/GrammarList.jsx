import { Heart, Check } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { hueOf } from "./mapLayout";

// عرض القائمة: الفروع والمجموعات والموضوعات كنصّ مرتّب، للتصفح السريع أو قارئ الشاشة
export default function GrammarList({ branches, dimmed, selected, onSelect }) {
  return (
    <div style={{ display: "grid", gap: S.x3 }}>
      {branches.map((b) => {
        const hue = hueOf(b.hue);
        return (
          <section key={b.id} aria-label={b.title} style={{ background: C.surface, border: `1px solid ${C.line}`, borderInlineStart: `4px solid ${hue}`, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.x2 }}>
            <h2 style={{ margin: 0, fontSize: T.x2, fontWeight: 700 }}>{b.title} <span dir="ltr" style={{ color: C.muted, fontSize: T.sm, fontFamily: "Georgia, serif" }}>{b.en}</span></h2>
            {b.groups.map((g) => (
              <div key={g.id} style={{ display: "grid", gap: S.sm }}>
                <div style={{ fontWeight: 700, fontSize: T.sm, color: hue }}>{g.title}</div>
                {g.topics.map((t) => (
                  <button key={t.id} type="button" onClick={() => onSelect(t.id)} aria-pressed={selected === t.id}
                    style={{ display: "flex", alignItems: "center", gap: S.lg, width: "100%", textAlign: "start", minHeight: TAP, padding: `${S.sm}px ${S.x2}px`, borderRadius: R.lg, border: `1px solid ${selected === t.id ? C.gold : C.line}`, background: selected === t.id ? alpha(C.gold, 0.12) : "transparent", color: C.text, fontFamily: "inherit", cursor: "pointer", opacity: dimmed(t) ? 0.35 : 1 }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 600 }}>{t.title}</span> <span dir="ltr" style={{ color: C.muted, fontSize: T.xs, fontFamily: "Georgia, serif" }}>{t.en}</span>
                      {t.summary && <span style={{ display: "block", color: C.muted, fontSize: T.xs, lineHeight: 1.6 }}>{t.summary}</span>}
                    </span>
                    {t.mastery !== null && t.mastery >= 75 && <Check size={14} color={C.green} strokeWidth={3} aria-label="متقن" />}
                    {t.marked && <Heart size={14} color={C.red} fill={C.red} aria-label="في المفضلة" />}
                    {t.level && <span className="madar-num" style={{ fontSize: T.xs, color: C.muted, flexShrink: 0 }}>{t.level}</span>}
                  </button>
                ))}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
