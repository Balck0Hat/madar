import { C, MONO, T, R, S } from "../../../shared/constants/theme";
import { DOMAINS } from "../../../shared/data/domains";
import { domainDone } from "../../../shared/utils/progress";
import { useNum } from "../../../shared/context/NumContext";
import { Bar } from "../../../shared/components/ui";
import { Icon } from "../../../shared/components/icons/Icon";

export default function DomainGrid({ progress, onOpenDomain }) {
  const num = useNum();
  return (
    <div style={{ padding: `${S.x4}px ${S.x4}px 0` }}>
      <div style={{ fontWeight: 700, marginBottom: S.xl }}>المجالات</div>
      {/* شبكة متجاوبة: عمودان على الهاتف (min(150px,46%) يضمنهما حتى عند 320px) و2–3 على الشاشات الواسعة */}
      <div className="madar-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(150px, 46%), 1fr))", gap: S.lg }}>
        {DOMAINS.map((d) => {
          const n = domainDone(progress, d.id, 0);
          return (
            <button key={d.id} type="button" className="madar-press" onClick={() => onOpenDomain(d.id, 0)} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.xl, padding: `${S.xl}px ${S.x2}px`, cursor: "pointer", color: C.text, textAlign: "start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: S.lg }}>
                <span style={{ fontWeight: 600, fontSize: T.md, display: "flex", alignItems: "center", gap: S.md }}><Icon id={d.id} size={16} color={d.color} />{d.name}</span>
                <span style={{ fontFamily: MONO, fontSize: T.sm, color: C.muted }}>{num(n)}/{num(8)}</span>
              </div>
              <Bar value={n / 8} color={d.color} h={5} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
