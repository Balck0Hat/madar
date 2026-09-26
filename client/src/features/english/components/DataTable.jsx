import { C, R, S, T } from "../../../shared/constants/theme";

// جدول بيانات مهمة الآيلتس الأولى: رأس ثابت، صفوف متناوبة، أرقام بخط أحادي العرض
export default function DataTable({ data }) {
  const { caption, columns, rows } = data;
  return (
    <figure dir="ltr" style={{ margin: 0, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, overflowX: "auto" }}>
      <figcaption style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: T.base, marginBottom: S.lg, textAlign: "left" }}>{caption}</figcaption>
      <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "Georgia, serif", fontSize: T.base, textAlign: "left" }}>
        <thead>
          <tr>{columns.map((c, i) => <th key={c} scope="col" style={{ padding: `${S.md}px ${S.lg}px`, borderBottom: `2px solid ${C.line}`, textAlign: i ? "right" : "left", position: "sticky", top: 0, background: C.surface }}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} style={{ background: ri % 2 ? C.surface2 : "transparent" }}>
              {r.map((cell, ci) => <td key={ci} className={ci ? "madar-num" : undefined} style={{ padding: `${S.md}px ${S.lg}px`, borderBottom: `1px solid ${C.line}`, textAlign: ci ? "right" : "left" }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
