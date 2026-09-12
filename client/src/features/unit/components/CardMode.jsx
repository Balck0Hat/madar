import { useRef } from "react";
import { C, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";
import PageBody from "./PageBody";

const SWIPE = 55;

// وضع البطاقات: صفحة واحدة تُقلب بالسحب أو بالنقر على جانبي الشاشة.
// لم يتغيّر سلوكه عند إضافة وضع التمرير؛ نُقل فقط إلى ملفه ليبقى كل ملف صغيراً.
export default function CardMode({ page, pages, content, info, unitId, quizCount, onNext, onPrev, onBack, onStartQuiz, onFinishRead, done, tools }) {
  const num = useNum();
  const touch = useRef(null);
  // اتجاه آخر قلب: التالي يدخل من جهة والسابق من الأخرى، بدل جهة واحدة للاثنين
  const dir = useRef(1);
  const goNext = () => { dir.current = 1; onNext(); };
  const goPrev = () => { dir.current = -1; onPrev(); };
  const p = pages[page];
  const last = page === pages.length - 1;

  const tap = (e) => {
    if (e.target.closest && e.target.closest("button,input,textarea,a")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (x < 0.38) goNext(); else if (x > 0.62) goPrev();
  };
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (dx > SWIPE) goNext(); else if (dx < -SWIPE) goPrev();
  };

  return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div role="region" aria-live="polite" aria-label={`صفحة ${page + 1} من ${pages.length}`} style={{ flex: 1, padding: `${S.lg}px ${S.x5}px ${S.xl}px` }}>
          <div key={page} className={`${dir.current > 0 ? "madar-turn-next" : "madar-turn-prev"} madar-read`} onClick={tap} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ userSelect: "none", WebkitUserSelect: "none" }}>
            <PageBody p={p} index={page} content={content} info={info} quizCount={quizCount} unitId={unitId} />
          </div>
        </div>
        {tools}
      </div>
      {/* الأسئلة اختياريّة: آخر البطاقات تُنهي الوحدة بالقراءة، والاختبار عرض لا شرط */}
      <div style={{ padding: `${S.lg}px ${S.x4}px ${S.x5}px`, display: "grid", gap: S.lg }}>
        <div style={{ display: "flex", gap: S.lg, alignItems: "center" }}>
          <Btn ghost paper full={false} small onClick={() => (page > 0 ? goPrev() : onBack())}>{page > 0 ? "السابق" : "خروج"}</Btn>
          <Btn primary color={last ? C.gold : info.color} style={{ color: C.bg }} onClick={() => (last ? (done ? onBack() : onFinishRead()) : goNext())}>
            {last ? (done ? "العودة إلى الخريطة" : "أنهيت الوحدة") : "التالي"}
          </Btn>
        </div>
        {last && quizCount > 0 && <Btn paper onClick={onStartQuiz}>{`اختبر نفسك · ${num(quizCount)} أسئلة (اختياري)`}</Btn>}
      </div>
    </>
  );
}
