import { useState, useRef, useEffect } from "react";
import { C, P, MONO, alpha } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";
import { useNum } from "../../../shared/context/PrefsContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useSpeech } from "../../../shared/hooks/useSpeech";
import { Btn, TopBar, Skeleton, ErrorState } from "../../../shared/components/ui";
import { contentService } from "../../content";
import { useResume } from "../hooks/useResume";
import { useFontScale } from "../hooks/useFontScale";
import { usePageKeys } from "../hooks/usePageKeys";
import { pageText } from "../utils/pageText";
import UnitPlaceholder from "./UnitPlaceholder";
import ResumeBar from "./ResumeBar";
import ReaderTools from "./ReaderTools";
import PageBody from "./PageBody";

const LABEL = { spark: "الشرارة", goals: "الأهداف", card: "الدرس", try: "جرّب", deep: "التعمق", thread: "الخيط", end: "الخلاصة" };

const buildPages = (content) => [
  { t: "spark" }, { t: "goals" },
  ...content.cards.map((c) => ({ t: "card", c })),
  ...(content.tryIt ? [{ t: "try" }] : []), ...(content.deep ? [{ t: "deep" }] : []), ...(content.thread ? [{ t: "thread" }] : []),
  { t: "end" },
];

// الدرس: بطاقات كقصص على ورق، تنقّل بالسحب أو النقر على جانبي الشاشة أو بالأسهم
export default function UnitScreen({ unitId, authored, resumeCard, fontScale, onBack, onStartQuiz, onSimulate, onResume, onFontScale }) {
  const num = useNum();
  const info = unitInfo(unitId);
  const [page, setPage] = useState(0);
  const [asked, setAsked] = useState(false); // هل حسم القارئ أمر الاستئناف
  const touch = useRef(null);
  const { data: content, loading, error, reload } = useAsync(() => contentService.getUnit(unitId), [unitId], { enabled: authored });

  const pages = content ? buildPages(content) : [];
  const go = (d) => setPage((i) => (i + d >= 0 && i + d < pages.length ? i + d : i));
  const next = () => go(1);
  const prev = () => go(-1);

  const speech = useSpeech();
  const font = useFontScale(fontScale, onFontScale);
  useResume(unitId, page, onResume);
  usePageKeys({ next, prev, exit: onBack });
  useEffect(() => { speech.stop(); }, [page]); // لا تُكمل القراءة الصوتية على صفحة أخرى

  if (!authored) return <UnitPlaceholder info={info} onBack={onBack} onSimulate={onSimulate} />;
  if (loading || error) {
    return (
      <div style={{ minHeight: "100vh", background: P.bg, color: P.ink }}>
        <TopBar paper title={info.domainName} onBack={onBack} />
        <div style={{ padding: "8px 20px" }}>{error ? <ErrorState message={error.message} onRetry={reload} onBack={onBack} /> : <Skeleton paper lines={6} />}</div>
      </div>
    );
  }

  const p = pages[page];
  const last = page === pages.length - 1;
  const saved = Number.isInteger(resumeCard) ? resumeCard : 0;
  // نعرض الشريط فقط في البداية وإن كان الموضع المحفوظ ضمن هذه النسخة من الدرس
  const showResume = !asked && page === 0 && saved > 0 && saved < pages.length;
  const tap = (e) => {
    if (e.target.closest && e.target.closest("button,input,textarea,a")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (x < 0.38) next(); else if (x > 0.62) prev();
  };
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (dx > 55) next(); else if (dx < -55) prev();
  };
  const quizCount = Math.min(10, content.questions?.length || 0);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: P.bg, color: P.ink, transition: "background .4s", "--unit-color": info.color, backgroundImage: `radial-gradient(140% 60% at 50% 0%, ${alpha(info.color, 0.07)}, transparent 60%)` }}>
      <div style={{ padding: "12px 12px 0", display: "flex", gap: 3 }}>
        {pages.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= page ? info.color : P.line, transition: "background .3s" }} />)}
      </div>
      <TopBar paper onBack={onBack}
        title={<span style={{ fontSize: 15 }}>{info.domainName} <span style={{ color: P.muted, fontWeight: 400 }}>· {LABEL[p.t]}</span></span>}
        right={<span style={{ fontFamily: MONO, color: P.muted, fontSize: 12 }}>{num(page + 1)}/{num(pages.length)}</span>} />
      {showResume && (
        <ResumeBar card={saved} total={pages.length}
          onResume={() => { setAsked(true); setPage(saved); }}
          onRestart={() => setAsked(true)} />
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div role="region" aria-live="polite" aria-label={`صفحة ${page + 1} من ${pages.length}`} style={{ flex: 1, padding: "8px 20px 10px" }}>
          <div key={page} className="madar-slide madar-read" onClick={tap} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ userSelect: "none", WebkitUserSelect: "none" }}>
            <PageBody p={p} index={page} content={content} info={info} quizCount={quizCount} />
          </div>
        </div>
        <ReaderTools font={font} speech={speech} onSpeak={() => speech.speak(pageText(p, content, info))} />
      </div>
      <div style={{ padding: "8px 16px 22px", display: "flex", gap: 8, alignItems: "center" }}>
        <Btn ghost paper full={false} small onClick={() => (page > 0 ? prev() : onBack())}>{page > 0 ? "السابق" : "خروج"}</Btn>
        <Btn primary color={last ? C.gold : info.color} style={{ color: "var(--bg)" }} onClick={() => (last ? onStartQuiz() : next())}>
          {last ? `ابدأ الاختبار (${num(quizCount)} أسئلة)` : "التالي"}
        </Btn>
      </div>
    </div>
  );
}
