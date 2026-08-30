import { C, MONO, T, R, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { DOMAINS } from "../../../shared/data/domains";
import { Icon } from "../../../shared/components/icons/Icon";
import { Bar } from "../../../shared/components/ui";

// لوحة إنجاز المجالات: أيقونة + شريط بلون المجال + النص "منجز/الكل"
// اللون وحده لا يكفي، لذا كل صف يحمل رقمه ونسبته كتابةً.
export default function DomainPanel({ rows }) {
  const num = useNum();
  const known = rows.filter((r) => DOMAINS.some((d) => d.id === r.domain));
  if (!known.length) return null;

  const done = known.reduce((s, r) => s + r.done, 0);
  const all = known.reduce((s, r) => s + r.total, 0);

  return (
    <section style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x4 }}>
      <h2 style={{ margin: 0, fontSize: T.lg, fontWeight: 700 }}>إنجازك في المجالات</h2>
      <p style={{ margin: `${S.xs}px 0 ${S.x2}px`, color: C.muted, fontSize: T.sm }}>أكملت {num(done)} وحدة من {num(all)}</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: S.x2 }}>
        {known.map((r) => {
          const dom = DOMAINS.find((d) => d.id === r.domain);
          const total = r.total || 8;
          const ratio = total ? Math.min(1, r.done / total) : 0;
          return (
            <li key={r.domain}>
              <div style={{ display: "flex", alignItems: "center", gap: S.lg, marginBottom: S.md }}>
                <Icon id={dom.id} size={16} color={dom.color} />
                <span style={{ flex: 1, fontSize: T.md, fontWeight: 600 }}>{dom.name}</span>
                <span style={{ fontFamily: MONO, fontSize: T.base, color: C.muted }} aria-label={`${dom.name}: ${r.done} من ${total}`}>
                  {num(r.done)}/{num(total)}
                </span>
              </div>
              <Bar value={ratio} color={dom.color} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
