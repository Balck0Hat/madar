import { createPortal } from "react-dom";

// ألوان حرفية عمداً هنا وحدها: صفحة الطباعة ورق دائماً، ورموز السمة قد تكون
// الوضع الداكن فتخرج صفحة سوداء تلتهم الحبر. ولا نُدرج أي عنصر تنقّل.
const PRINT_CSS = `
.madar-print-root{display:none}
@media print{
  body > *:not(.madar-print-root){display:none !important}
  .madar-print-root{display:block !important;background:#fff;color:#000;padding:0;margin:0}
  .madar-print-root *{color:#000 !important;background:transparent !important;box-shadow:none !important}
  .madar-print-root mark{background:#eeeeee !important;border-bottom:1px solid #000}
  .madar-print-root h1{font-size:22pt;margin:0 0 4pt}
  .madar-print-root h2{font-size:13pt;margin:14pt 0 4pt}
  .madar-print-root p,.madar-print-root li{font-size:11.5pt;line-height:1.9;margin:0 0 6pt}
  .madar-print-root section{break-inside:avoid;page-break-inside:avoid}
  .madar-print-root .quiet{color:#555 !important;font-size:9.5pt}
  .madar-print-root .rule{border:0;border-top:1px solid #bbb;margin:14pt 0}
  @page{margin:18mm}
}
`;

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
