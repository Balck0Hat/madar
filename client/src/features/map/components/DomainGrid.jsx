import { C, MONO } from "../../../shared/constants/theme";
import { DOMAINS } from "../../../shared/data/domains";
import { domainDone } from "../../../shared/utils/progress";
import { useNum } from "../../../shared/context/NumContext";
import { Bar } from "../../../shared/components/ui";
import { Icon } from "../../../shared/components/icons/Icon";

export default function DomainGrid({ progress, onOpenDomain }) {
  const num = useNum();
  return (
    <div style={{ padding: "18px 16px 0" }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>المجالات</div>
      {/* شبكة متجاوبة: عمودان على الهاتف (min(150px,46%) يضمنهما حتى عند 320px) و2–3 على الشاشات الواسعة */}
      <div className="madar-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(150px, 46%), 1fr))", gap: 8 }}>
        {DOMAINS.map((d) => {
          const n = domainDone(progress, d.id, 0);
          return (
            <button key={d.id} type="button" className="madar-press" onClick={() => onOpenDomain(d.id, 0)} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 12px", cursor: "pointer", color: C.text, textAlign: "start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}><Icon id={d.id} size={16} color={d.color} />{d.name}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.muted }}>{num(n)}/{num(8)}</span>
              </div>
              <Bar value={n / 8} color={d.color} h={5} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
