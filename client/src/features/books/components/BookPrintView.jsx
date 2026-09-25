import { createPortal } from "react-dom";
import { PRINT_CSS } from "../../../shared/styles/print";
import { SourceLine } from "./BookScreen";

// الكتاب كاملاً للطباعة/الحفظ PDF: غلاف ومقدمة وفهرس، ثم كل فصل بأقسامه وتمرينه وخلاصته
export default function BookPrintView({ book }) {
  if (!book || typeof document === "undefined") return null;
  return createPortal(
    <div className="madar-print-root" dir="rtl" lang="ar" style={{ fontFamily: '"Noto Naskh Arabic", Georgia, serif' }}>
      <style>{PRINT_CSS}</style>
      <h1>{book.title}</h1>
      <p className="quiet">{book.subtitle} · مدار · {book.chapters.length} فصول</p>
      {book.tagline && <p>{book.tagline}</p>}
      {book.intro && <section><h2>مقدمة</h2><p>{book.intro}</p></section>}
      <hr className="rule" />
      <section>
        <h2>المحتويات</h2>
        <ul className="toc" style={{ listStyle: "none", paddingInlineStart: 0 }}>{book.chapters.map((c) => <li key={c.chapterId}>{c.order}. {c.title}</li>)}</ul>
      </section>
      {book.chapters.map((c) => (
        <div className="unit" key={c.chapterId}>
          <h3>{c.order}. {c.title}</h3>
          {c.hook && <p>{c.hook}</p>}
          <hr className="rule" />
          {(c.sections || []).map((s, i) => <section key={i}><h2>{s.h}</h2><p>{s.p}</p></section>)}
          {c.exercise && <section><h2>{c.exercise.title || "تمرين اليوم"}</h2><ol>{c.exercise.steps.map((st, i) => <li key={i}>{st}</li>)}</ol></section>}
          {c.takeaways?.length > 0 && <section><h2>الخلاصة</h2><ul>{c.takeaways.map((t, i) => <li key={i}>{t}</li>)}</ul></section>}
        </div>
      ))}
      {book.sources?.length > 0 && <section><h2>بُني على</h2><ul>{book.sources.map((s, i) => <li key={i}><SourceLine text={s} /></li>)}</ul></section>}
    </div>,
    document.body,
  );
}
