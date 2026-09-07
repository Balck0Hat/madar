// أنماط الطباعة، مشتركة بين طباعة الوحدة وطباعة المجال.
// ألوان حرفية عمداً: الصفحة المطبوعة ورق دائماً، ورموز السمة قد تكون الوضع
// الداكن فتخرج صفحة سوداء تلتهم الحبر. ولا يُدرج أي عنصر تنقّل.
export const PRINT_CSS = `
.madar-print-root{display:none}
@media print{
  body > *:not(.madar-print-root){display:none !important}
  .madar-print-root{display:block !important;background:#fff;color:#000;padding:0;margin:0}
  .madar-print-root *{color:#000 !important;background:transparent !important;box-shadow:none !important}
  .madar-print-root mark{background:#eeeeee !important;border-bottom:1px solid #000}
  .madar-print-root h1{font-size:22pt;margin:0 0 4pt}
  .madar-print-root h2{font-size:13pt;margin:14pt 0 4pt}
  .madar-print-root h3{font-size:16pt;margin:0 0 6pt}
  .madar-print-root p,.madar-print-root li{font-size:11.5pt;line-height:1.9;margin:0 0 6pt}
  .madar-print-root section{break-inside:avoid;page-break-inside:avoid}
  .madar-print-root .quiet{color:#555 !important;font-size:9.5pt}
  .madar-print-root .rule{border:0;border-top:1px solid #bbb;margin:14pt 0}
  /* كل وحدة تبدأ صفحة جديدة في ملف المجال، ولا ينطبق على الوحدة المفردة */
  .madar-print-root .unit{break-before:page;page-break-before:always}
  .madar-print-root .unit:first-of-type{break-before:auto;page-break-before:auto}
  .madar-print-root .toc li{font-size:11pt;margin:0 0 3pt}
  @page{margin:18mm}
}
`;
