import { useRef } from "react";
import { C } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";
import PageBody from "./PageBody";

const SWIPE = 55;

// وضع البطاقات: صفحة واحدة تُقلب بالسحب أو بالنقر على جانبي الشاشة.
// لم يتغيّر سلوكه عند إضافة وضع التمرير؛ نُقل فقط إلى ملفه ليبقى كل ملف صغيراً.
export default function CardMode({ page, pages, content, info, unitId, quizCount, onNext, onPrev, onBack, onStartQuiz, tools }) {
  const num = useNum();
  const touch = useRef(null);
  const p = pages[page];
  const last = page === pages.length - 1;

  const tap = (e) => {
    if (e.target.closest && e.target.closest("button,input,textarea,a")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (x < 0.38) onNext(); else if (x > 0.62) onPrev();
  };
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (dx > SWIPE) onNext(); else if (dx < -SWIPE) onPrev();
  };

  return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div role="region" aria-live="polite" aria-label={`صفحة ${page + 1} من ${pages.length}`} style={{ flex: 1, padding: "8px 20px 10px" }}>
          <div key={page} className="madar-slide madar-read" onClick={tap} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ userSelect: "none", WebkitUserSelect: "none" }}>
            <PageBody p={p} index={page} content={content} info={info} quizCount={quizCount} unitId={unitId} />
          </div>
        </div>
        {tools}
      </div>
      <div style={{ padding: "8px 16px 22px", display: "flex", gap: 8, alignItems: "center" }}>
        <Btn ghost paper full={false} small onClick={() => (page > 0 ? onPrev() : onBack())}>{page > 0 ? "السابق" : "خروج"}</Btn>
        <Btn primary color={last ? C.gold : info.color} style={{ color: C.bg }} onClick={() => (last ? onStartQuiz() : onNext())}>
          {last ? `ابدأ الاختبار (${num(quizCount)} أسئلة)` : "التالي"}
        </Btn>
      </div>
    </>
  );
}
