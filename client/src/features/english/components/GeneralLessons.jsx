import { useMemo, useState } from "react";
import { BookOpenText, Check, Search } from "lucide-react";
import { C, R, S, T, TAP, alpha, inputStyle } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Card } from "../../../shared/components/ui";

// دروس الإنجليزية العامة مجمّعة بمحطات الرحلة السبع، الاسم الإنجليزي أولاً والعربي تحته، مع بحث سريع
export default function GeneralLessons({ track, onLesson }) {
  const num = useNum();
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    const hit = (l) => !s || l.title.includes(q.trim()) || (l.en || "").toLowerCase().includes(s);
    const stages = track.stages || [];
    const byStage = stages.map((st, i) => ({ ...st, n: i + 1, lessons: track.lessons.filter((l) => l.stage?.id === st.id && hit(l)) }));
    const rest = track.lessons.filter((l) => !l.stage && hit(l));
    return [...byStage, ...(rest.length ? [{ id: "other", title: "أخرى", en: "Other", lessons: rest }] : [])].filter((g) => g.lessons.length);
  }, [track, q]);
  const pill = (pct) => { const ok = pct >= 75; const tone = ok ? C.green : C.gold; return <span className="madar-num" style={{ fontSize: T.xs, fontWeight: 700, color: tone, background: alpha(tone, 0.12), borderRadius: R.pill, padding: `${S.xs}px ${S.x2}px`, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: S.xs }}>{ok && <Check size={12} aria-hidden="true" />}{num(pct)}٪</span>; };
  return (
    <>
      <p style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}>{track.text}</p>
      <div style={{ position: "relative" }}>
        <Search size={16} color={C.muted} aria-hidden="true" style={{ position: "absolute", insetInlineStart: S.x2, top: "50%", transform: "translateY(-50%)" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="ابحث في الدروس" placeholder={`ابحث في ${num(track.lessons.length)} درساً…`} style={{ ...inputStyle, paddingInlineStart: S.x7, minHeight: TAP }} />
      </div>
      {!groups.length && <div role="status" style={{ color: C.muted, textAlign: "center", padding: S.x4 }}>لا درس يطابق «{q}». جرّب اسم الزمن بالإنجليزية أو العربية.</div>}
      {groups.map((g) => {
        const done = g.lessons.filter((l) => l.best?.pct >= 75).length;
        return (
          <section key={g.id} aria-label={g.title} style={{ display: "grid", gap: S.lg }}>
            <h2 style={{ margin: 0, display: "flex", alignItems: "baseline", gap: S.md, fontSize: T.base }}>
              {g.n && <span className="madar-num" style={{ color: C.gold, fontWeight: 700 }}>{String(g.n).padStart(2, "0")}</span>}
              <span dir="ltr" style={{ fontWeight: 700 }}>{g.en}</span>
              <span style={{ color: C.muted, fontWeight: 400, fontSize: T.sm }}>{g.title}</span>
              <span className="madar-num" style={{ marginInlineStart: "auto", color: C.muted, fontWeight: 400, fontSize: T.xs }}>{num(done)}/{num(g.lessons.length)}</span>
            </h2>
            {g.lessons.map((l) => (
              <Card key={l.tag} onClick={() => onLesson(l.tag)} style={{ display: "flex", gap: S.x2, alignItems: "center" }}>
                <BookOpenText size={22} color={C.gold} aria-hidden="true" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div dir="ltr" style={{ fontWeight: 700, textAlign: "end" }}>{l.en || l.title}</div>
                  <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs }}>{l.en ? `${l.title} · ` : ""}<span className="madar-num">{l.level}</span> · نحو {num(l.minutes)} دقيقة</div>
                </div>
                {l.best ? pill(l.best.pct) : null}
              </Card>
            ))}
          </section>
        );
      })}
    </>
  );
}
