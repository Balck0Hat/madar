import { useState } from "react";
import { P, MONO, alpha, T, R, S } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";
import { useNum } from "../../../shared/context/PrefsContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { TopBar, Skeleton, ErrorState } from "../../../shared/components/ui";
import { contentService } from "../../content";
import { useResume } from "../hooks/useResume";
import { useFontScale } from "../hooks/useFontScale";
import { usePageKeys } from "../hooks/usePageKeys";
import { useReadMode } from "../hooks/useReadMode";
import { buildPages, shortLabel, pageTitles } from "../utils/pages";
import UnitPlaceholder from "./UnitPlaceholder";
import UnitLocked from "./UnitLocked";
import ResumeBar from "./ResumeBar";
import ReaderTools from "./ReaderTools";
import IndexSheet from "./IndexSheet";
import CardMode from "./CardMode";
import ScrollMode from "./ScrollMode";

// الدرس: بطاقات كقصص على ورق، أو عمود واحد يُمرَّر ويُبحث فيه.
// موضع القراءة (page) واحد للوضعين عمداً: هو رقم القسم لا رقم الشريحة، فمن
// بدّل الوضع يجد نفسه عند القسم ذاته، ومن عاد للدرس يستأنف من حيث توقف.
export default function UnitScreen({ unitId, authored, resumeCard, fontScale, readMode, onBack, onStartQuiz, onSimulate, onResume, onFontScale, onReadMode }) {
  const num = useNum();
  const info = unitInfo(unitId);
  const [page, setPage] = useState(0);
  const [jump, setJump] = useState({ i: 0, n: 0 }); // طلب قفز: nonce يميّز كل طلب حتى لو تكرّر القسم
  const [sheet, setSheet] = useState(false);
  const [asked, setAsked] = useState(false); // هل حسم القارئ أمر الاستئناف
  const { data: content, loading, error, reload } = useAsync(() => contentService.getUnit(unitId), [unitId], { enabled: authored });

  const font = useFontScale(fontScale, onFontScale);
  const [mode, setMode] = useReadMode(readMode, onReadMode);
  const pages = content ? buildPages(content) : [];
  const goTo = (i) => { setPage(i); setJump({ i, n: Date.now() }); };
  const step = (d) => setPage((i) => (i + d >= 0 && i + d < pages.length ? i + d : i));
  useResume(unitId, page, onResume);
  // الأسهم تقلب البطاقات في وضع البطاقات وحده: في وضع التمرير هي أداة المتصفح
  // للتمرير نفسه، وفي وضع الفهرس المفتوح لا يصح أن تُقلب بطاقة خلف اللوح.
  const keys = sheet || mode !== "cards";
  usePageKeys({ next: keys ? undefined : () => step(1), prev: keys ? undefined : () => step(-1), exit: sheet ? undefined : onBack });

  if (!authored) return <UnitPlaceholder info={info} onBack={onBack} onSimulate={onSimulate} />;
  if (loading || error) {
    return (
      <div style={{ minHeight: "100vh", background: P.bg, color: P.ink }}>
        <TopBar paper title={info.domainName} onBack={onBack} />
        <div style={{ padding: `${S.lg}px ${S.x5}px` }}>{error ? <ErrorState message={error.message} onRetry={reload} onBack={onBack} /> : <Skeleton paper lines={6} />}</div>
      </div>
    );
  }
  if (content.locked === true) return <UnitLocked info={info} content={content} onBack={onBack} />;

  const at = Math.min(page, Math.max(0, pages.length - 1));
  const saved = Number.isInteger(resumeCard) ? resumeCard : 0;
  // نعرض الشريط فقط في البداية وإن كان الموضع المحفوظ ضمن هذه النسخة من الدرس
  const showResume = !asked && at === 0 && saved > 0 && saved < pages.length;
  const quizCount = Math.min(10, content.questions?.length || 0);
  const tools = <ReaderTools font={font} mode={mode} onMode={(m) => { setMode(m); setJump({ i: at, n: Date.now() }); }} onIndex={() => setSheet(true)} />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: P.bg, color: P.ink, transition: "background .4s", "--unit-color": info.color, backgroundImage: `radial-gradient(140% 60% at 50% 0%, ${alpha(info.color, 0.07)}, transparent 60%)` }}>
      <div style={{ padding: `${S.x2}px ${S.x2}px 0`, display: "flex", gap: S.xs }}>
        {pages.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: R.pill, background: i <= at ? info.color : P.line, transition: "background .3s" }} />)}
      </div>
      <TopBar paper onBack={onBack}
        title={<span style={{ fontSize: T.lg }}>{info.domainName} <span style={{ color: P.muted, fontWeight: 400 }}>· {shortLabel(pages[at])}</span></span>}
        right={<span style={{ fontFamily: MONO, color: P.muted, fontSize: T.sm }}>{num(at + 1)}/{num(pages.length)}</span>} />
      {showResume && (
        <ResumeBar card={saved} total={pages.length}
          onResume={() => { setAsked(true); goTo(saved); }}
          onRestart={() => setAsked(true)} />
      )}
      {mode === "cards"
        ? <CardMode page={at} pages={pages} content={content} info={info} unitId={unitId} quizCount={quizCount}
            onNext={() => step(1)} onPrev={() => step(-1)} onBack={onBack} onStartQuiz={onStartQuiz} tools={tools} />
        : <ScrollMode pages={pages} content={content} info={info} unitId={unitId} quizCount={quizCount}
            active={at} jump={jump} onSection={setPage} onStartQuiz={onStartQuiz} tools={tools} />}
      {sheet && (
        <IndexSheet titles={pageTitles(pages)} current={at}
          onPick={(i) => { setSheet(false); goTo(i); }} onClose={() => setSheet(false)} />
      )}
    </div>
  );
}
