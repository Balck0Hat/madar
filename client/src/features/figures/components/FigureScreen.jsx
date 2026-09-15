import { useState } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { P, READ, alpha, T, R, S, TAP } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import Prose from "../../../shared/components/ui/Prose";
import { getFigure, getPublicFigure, listFigures } from "../services/figures.service";
import { useFigureProgress } from "../hooks/useFigureProgress";
import { colorOf } from "./figures.meta";
import FigureHeader from "./FigureHeader";
import FigureStory from "./FigureStory";

const body = { fontFamily: READ, fontSize: "1.07em", lineHeight: 1.95 };
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const minutes = (n) => Math.max(1, Math.round(n / 160));
const publicUrl = (id) => `${window.location.origin}/f/${encodeURIComponent(id)}`;

// ملف شخصية: مستويان للقراءة يُبدَّل بينهما بلا إعادة تحميل. القائمة تُجلب
// معه لأن الشريط الزمني والخريطة و«المرتبطون» و«التالي» كلها منها.
// publicMode: صفحة مشاركة بلا حساب — ملف واحد، بلا قائمة ولا تظليل ولا تقدّم.
export default function FigureScreen({ figureId, onBack, onOpen, onOpenUnit, publicMode = false }) {
  const num = useNum();
  const [depth, setDepth] = useState("quick");
  const [sources, setSources] = useState(false);
  const [shared, setShared] = useState(false);
  const progress = useFigureProgress(!publicMode);
  const { data, loading, error, reload } = useAsync(
    () => (publicMode ? getPublicFigure(figureId).then((figure) => ({ figure, list: [] }))
      : Promise.all([getFigure(figureId), listFigures().catch(() => [])]).then(([figure, list]) => ({ figure, list }))),
    [figureId, publicMode],
  );
  const f = data?.figure;
  const list = data?.list || [];
  const color = f ? colorOf(f.category) : P.gold;
  const storyWords = f ? f.story.reduce((n, s) => n + words(s.p), 0) : 0;

  const share = async () => {
    const url = publicUrl(figureId);
    try {
      if (navigator.share) await navigator.share({ title: f.name, url });
      else await navigator.clipboard.writeText(url);
      setShared(true); setTimeout(() => setShared(false), 2500);
    } catch (err) { if (err?.name !== "AbortError") console.warn("[figures] share failed:", err.message); }
  };

  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.ink, "--unit-color": color, backgroundImage: `radial-gradient(140% 60% at 50% 0%, ${alpha(color, 0.07)}, transparent 60%)` }}>
      <TopBar paper title={<span style={{ fontSize: T.lg }}>{publicMode ? "مدار · الشخصيات" : "الشخصيات"}</span>} onBack={onBack} />
      <div className="madar-read" style={{ padding: `${S.lg}px ${S.x5}px ${S.x8}px` }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton paper lines={6} />);
  if (error || !f) return shell(<ErrorState message={error?.message || "الشخصية غير متاحة"} onRetry={reload} onBack={onBack} />);

  const Tab = ({ k, label, m }) => (
    <button type="button" role="tab" aria-selected={depth === k} onClick={() => setDepth(k)}
      style={{ flex: 1, minHeight: TAP, fontFamily: "inherit", fontWeight: 700, fontSize: T.md, borderRadius: R.lg, cursor: "pointer",
        background: depth === k ? alpha(color, 0.14) : P.card, color: depth === k ? color : P.muted, border: `1px solid ${depth === k ? color : P.line}` }}>
      {label} <span style={{ fontWeight: 400, fontSize: T.xs }}>· {num(m)} د</span>
    </button>
  );
  const open = (id) => { setDepth("quick"); onOpen?.(id); };

  return shell(
    <>
      <FigureHeader figure={f} list={list} color={color} onOpen={publicMode ? null : open} onShare={share} shared={shared} />
      <div role="tablist" style={{ display: "flex", gap: S.lg, margin: `${S.x5}px 0 ${S.x4}px` }}>
        <Tab k="quick" label="ملخص سريع" m={minutes(words(f.quick))} />
        <Tab k="story" label="القصة الكاملة" m={minutes(storyWords)} />
      </div>
      {depth === "quick" ? (
        <div key="quick" className="madar-in">
          <div style={{ display: "flex", alignItems: "center", gap: S.md, color: P.muted, fontSize: ".8em", marginBottom: S.x2 }}>
            <Clock size={13} aria-hidden="true" />نحو {num(minutes(words(f.quick)))} دقائق قراءة
          </div>
          <div style={body}><Prose text={f.quick} mono /></div>
          <div style={{ marginTop: S.x5 }}>
            <Btn primary color={color} style={{ color: P.bg }} onClick={() => setDepth("story")}>{`اقرأ القصة الكاملة · ${num(f.story.length)} أقسام`}</Btn>
          </div>
          {f.sources?.length > 0 && (
            <div style={{ marginTop: S.x4, borderTop: `1px solid ${P.line}` }}>
              <button type="button" onClick={() => setSources((v) => !v)} aria-expanded={sources}
                style={{ display: "flex", alignItems: "center", gap: S.md, minHeight: TAP, width: "100%", background: "none", border: 0, padding: 0, color: P.muted, fontFamily: "inherit", fontSize: ".85em", fontWeight: 600, cursor: "pointer" }}>
                <ChevronDown size={15} aria-hidden="true" style={{ transform: sources ? "rotate(180deg)" : "none" }} />المصادر <span style={{ fontWeight: 400 }}>· {num(f.sources.length)}</span>
              </button>
              {sources && <div className="madar-in" style={{ color: P.muted, fontSize: ".8em", lineHeight: 1.8, paddingBottom: S.x2 }}>{f.sources.map((s, i) => <div key={i}>· {s}</div>)}</div>}
            </div>
          )}
        </div>
      ) : (
        <div key="story" className="madar-in">
          <FigureStory figure={f} list={list} color={color} progress={publicMode ? null : progress} noteId={publicMode ? null : `figure:${f.figureId}`}
            onOpen={open} onOpenUnit={publicMode ? null : onOpenUnit} onExit={() => setDepth("quick")} />
        </div>
      )}
    </>,
  );
}
