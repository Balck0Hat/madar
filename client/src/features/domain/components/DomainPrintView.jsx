import { createPortal } from "react-dom";
import { PRINT_CSS } from "../../../shared/styles/print";
import { RING_NAMES } from "../../../shared/data/curriculum";

const Block = ({ title, children }) => (
  <section>
    <h2>{title}</h2>
    {children}
  </section>
);

function UnitPart({ unit, index }) {
  return (
    <div className="unit">
      <h3>{index}. {unit.title}</h3>
      {unit.spark && <p>{unit.spark}</p>}
      <hr className="rule" />
      {(unit.cards || []).map((card, i) => (
        <Block key={i} title={`${i + 1}. ${card.h}`}>
          <p>{card.p}</p>
          {card.points?.length > 0 && <ul>{card.points.map((t, k) => <li key={k}>{t}</li>)}</ul>}
          {card.after && <p>{card.after}</p>}
        </Block>
      ))}
      {unit.tryIt && <Block title={`جرّب: ${unit.tryIt.title}`}><p>{unit.tryIt.text}</p></Block>}
      {unit.deep && <Block title={`للتعمق: ${unit.deep.title}`}><p>{unit.deep.why}</p></Block>}
      {Boolean(unit.summary?.length) && (
        <Block title="الخلاصة"><ul>{unit.summary.map((line, i) => <li key={i}>{line}</li>)}</ul></Block>
      )}
    </div>
  );
}

// ملف المجال كاملاً: غلاف، ثم فهرس، ثم وحدة في كل صفحة.
// الفهرس ليس زينة: أربع وعشرون وحدة في ملف واحد لا يُتنقّل فيها بلا دليل.
export default function DomainPrintView({ data, domain }) {
  if (!data || typeof document === "undefined") return null;
  let n = 0;
  const numbered = data.rings.map((r) => ({ ...r, units: r.units.map((u) => ({ ...u, n: ++n })) }));
  return createPortal(
    <div className="madar-print-root" dir="rtl" lang="ar" style={{ fontFamily: '"Noto Naskh Arabic", Georgia, serif' }}>
      <style>{PRINT_CSS}</style>
      <h1>{domain.name}</h1>
      <p className="quiet">
        مدار · {data.units} وحدة
        {data.lockedRings > 0 && ` · ${data.lockedRings === 1 ? "مدار واحد" : `${data.lockedRings} مدارات`} لم يُفتح بعد وليس في هذا الملف`}
      </p>
      {domain.desc && <p>{domain.desc}</p>}
      <hr className="rule" />
      <Block title="المحتويات">
        {numbered.map((r) => (
          <div key={r.ring}>
            <p className="quiet">{RING_NAMES[r.ring]}</p>
            <ul className="toc">{r.units.map((u) => <li key={u.unitId}>{u.n}. {u.title}</li>)}</ul>
          </div>
        ))}
      </Block>
      {numbered.flatMap((r) => r.units).map((u) => <UnitPart key={u.unitId} unit={u} index={u.n} />)}
    </div>,
    document.body,
  );
}
