import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { C, T, R, S, TAP } from "../../../shared/constants/theme";
import { getFullBook } from "../services/books.service";
import BookPrintView from "./BookPrintView";

// «تنزيل PDF» عبر خط الطباعة في المتصفح، كما في الدروس والمجالات: حوار الطباعة
// يتيح «الحفظ كـ PDF» على كل المنصات ويرسم العربية صحيحة بلا خطوط مضمّنة.
export default function BookPrintButton({ bookId }) {
  const [book, setBook] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!book) return undefined;
    const t = setTimeout(() => window.print(), 200);
    return () => clearTimeout(t);
  }, [book]);

  const run = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    try { setBook(await getFullBook(bookId)); } catch (e) { setErr(e.message || "تعذّر تجهيز الملف"); } finally { setBusy(false); }
  };

  return (
    <div style={{ display: "grid", gap: S.sm }}>
      <button type="button" onClick={run} disabled={busy} className="madar-press"
        style={{ minHeight: TAP, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: S.md, fontFamily: "inherit", fontSize: T.sm, fontWeight: 700, cursor: busy ? "wait" : "pointer", color: C.muted, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.xl }}>
        <Download size={16} aria-hidden="true" />{busy ? "جارٍ التجهيز…" : "تنزيل الكتاب PDF"}
      </button>
      {err && <div role="alert" style={{ color: C.red, fontSize: T.xs }}>{err}</div>}
      {book && <BookPrintView book={book} />}
    </div>
  );
}
