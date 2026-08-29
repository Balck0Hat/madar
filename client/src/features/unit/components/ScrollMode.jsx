import { useRef, useEffect, useMemo } from "react";
import { C, P } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";
import { Marked, NoteToolbar, useSelectionNote } from "../../notes";
import { useSectionSpy } from "../hooks/useSectionSpy";
import { pageTitle } from "../utils/pages";
import SectionBody from "./SectionBody";

// وضع التمرير: الدرس كلّه في عمود واحد.
// لماذا يستحق الوجود: البطاقات تمنع المسح السريع، والعودة لفقرة سابقة، وبحث
// المتصفح (Ctrl+F) — وهي ثلاث حاجات أساسية لمادة يُذاكَر منها.
// خطّاف التظليل واحد للعمود كله (لا واحد لكل قسم) كي لا تتضاعف طلبات الشبكة.
export default function ScrollMode({ pages, content, info, unitId, quizCount, active, jump, onSection, onStartQuiz, tools }) {
  const num = useNum();
  const host = useRef(null);
  const notes = useSelectionNote(unitId, active);
  useSectionSpy(host, pages.length, onSection);

  // القفز يأتي من الفهرس أو من شريط الاستئناف أو من تبديل الوضع؛ nonce يميّز
  // كل طلب قفز على حدة حتى لو تكرّر القسم نفسه.
  useEffect(() => {
    const el = host.current?.querySelector(`[data-section="${jump.i}"]`);
    el?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [jump.n, jump.i]);

  const byPage = useMemo(() => {
    const m = new Map();
    notes.notes.forEach((n) => m.set(n.page, [...(m.get(n.page) || []), n]));
    return m;
  }, [notes.notes]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div ref={host} onClick={notes.onClick} style={{ padding: "4px 20px 12px" }}>
        <div ref={notes.ref} className="madar-read">
          {pages.map((p, i) => (
            <section key={i} data-section={i} aria-label={pageTitle(p)}
              style={{ scrollMarginTop: 58, padding: "14px 0 20px", borderBottom: i < pages.length - 1 ? `1px solid ${P.line}` : "none" }}>
              <SectionBody p={p} content={content} info={info} quizCount={quizCount} unitId={unitId} hint={false}
                mark={(text) => <Marked text={text} notes={byPage.get(i) || []} />} />
            </section>
          ))}
        </div>
        {quizCount > 0 && (
          <div style={{ marginTop: 18 }}>
            <Btn primary color={C.gold} style={{ color: C.bg }} onClick={onStartQuiz}>
              {`ابدأ الاختبار (${num(quizCount)} أسئلة)`}
            </Btn>
          </div>
        )}
        <NoteToolbar sel={notes.sel} busy={notes.busy} err={notes.err} onClose={notes.close} onSave={notes.save} onEdit={notes.edit} onRemove={notes.remove} />
      </div>
      {tools}
    </div>
  );
}
