import { createPortal } from "react-dom";
import { PRINT_CSS } from "../../../shared/styles/print";


const Block = ({ title, children }) => (
  <section>
    <h2>{title}</h2>
    {children}
  </section>
);

// نسخة الوحدة القابلة للطباعة (ومنها «حفظ كـ PDF» في حوار المتصفح)
export default function UnitPrintView({ unit, info, notes = [] }) {
  if (!unit || typeof document === "undefined") return null;
  return createPortal(
    <div className="madar-print-root" dir="rtl" lang="ar" style={{ fontFamily: '"Noto Naskh Arabic", Georgia, serif' }}>
      <style>{PRINT_CSS}</style>
      <h1>{unit.title || info?.title}</h1>
      <p className="quiet">{info?.domainName} · مدار</p>
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
        <Block title="الخلاصة">
          <ul>{unit.summary.map((line, i) => <li key={i}>{line}</li>)}</ul>
        </Block>
      )}
      {Boolean(notes.length) && (
        <Block title="تظليلاتي">
          {notes.map((n) => (
            <div key={n.id} style={{ marginBottom: 8 }}>
              <p><mark>{n.text}</mark></p>
              {n.note && <p className="quiet">— {n.note}</p>}
            </div>
          ))}
        </Block>
      )}
    </div>,
    document.body,
  );
}
