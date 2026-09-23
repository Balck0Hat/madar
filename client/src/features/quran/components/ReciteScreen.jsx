import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, EyeOff } from "lucide-react";
import { C, P, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import { getSura, reviewAyah, audioUrl } from "../services/quran.service";
import { useRecorder } from "../hooks/useRecorder";
import { useRecite } from "../hooks/useRecite";
import { useAudio } from "../hooks/useAudio";
import AyahText from "./AyahText";
import ReciteSummary, { perAyah } from "./ReciteSummary";

// التسميع المباشر لآية أو لسورة كاملة (a = "all"): اضغط الميكروفون واقرأ؛
// الكلمات تتلوّن وأنت تقرأ، والآية الحالية تتبعك على الشاشة. وضع الإخفاء
// يخفي النصّ كله فلا تظهر الكلمة إلا حين تقولها. الصوت لا يُحفظ.
export default function ReciteScreen({ s, a, onBack, onNext }) {
  const num = useNum();
  const whole = a === "all";
  const rec = useRecite();
  const mic = useRecorder(rec.push);
  const audio = useAudio();
  const [hideMode, setHideMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const rowRefs = useRef({});
  const { data, loading, error, reload } = useAsync(() => getSura(s), [s]);
  const ayahs = data ? (whole ? data.ayahs : data.ayahs.filter((x) => x.a === Number(a))) : [];
  const bounds = rec.ayahs || [];
  const current = bounds.find((b) => rec.cursor >= b.from && rec.cursor < b.to)?.a;

  useEffect(() => { rowRefs.current[current]?.scrollIntoView?.({ block: "center", behavior: "smooth" }); }, [current]);
  const start = async () => { setSaved(false); try { await rec.begin(Number(s), whole ? null : Number(a)); await mic.start(); } catch { /* الخطأ يُعرض من الخطّاف */ } };
  const stop = () => { mic.stop(); rec.finish(); };
  useEffect(() => { if (rec.phase === "done") mic.stop(); }, [rec.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const live = rec.status.length > 0;
  const finished = rec.phase === "done" || (live && !mic.recording);
  const rows = finished ? perAyah(bounds, rec.status) : [];
  const decide = async (allCorrect) => {
    for (const r of rows.filter((x) => x.heard)) await reviewAyah(Number(s), r.a, allCorrect || r.miss === 0).catch(() => {});
    setSaved(true);
  };
  // تُسجَّل تلقائياً فقط حين كل ما قُرئ كامل وبلا أخطاء؛ غير ذلك القارئ يقرّر
  useEffect(() => { if (finished && rows.length && rows.some((r) => r.heard) && rows.every((r) => !r.heard || r.ok === r.total) && !saved) decide(true); }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.ink, "--unit-color": P.gold }}>
      <TopBar paper title={<span style={{ fontSize: T.lg }}>{whole ? "تسميع سورة" : "تسميع"}</span>} onBack={() => { stop(); rec.close(); onBack(); }} />
      <div className="madar-read" style={{ padding: `${S.lg}px ${S.x5}px ${S.x9}px` }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton paper lines={5} />);
  if (error || !ayahs.length) return shell(<ErrorState message={error?.message || "الآية غير متاحة"} onRetry={reload} onBack={onBack} />);

  const heardWords = rec.ok;
  const total = rec.status.length || ayahs.reduce((n, x) => n + x.n.split(" ").length, 0);
  return shell(
    <>
      <div style={{ display: "flex", alignItems: "center", gap: S.lg }}>
        <div style={{ color: P.muted, fontSize: T.sm, flex: 1 }}>سورة {data.name}{whole ? ` · ${num(ayahs.length)} آية` : ` · آية ${num(a)}`}</div>
        <button type="button" onClick={() => setHideMode((v) => !v)} aria-pressed={hideMode} className="madar-press"
          style={{ display: "inline-flex", alignItems: "center", gap: S.md, minHeight: TAP - S.xl, fontFamily: "inherit", fontSize: T.xs, fontWeight: 700, cursor: "pointer", color: hideMode ? P.gold : P.muted, background: hideMode ? alpha(P.gold, 0.14) : P.card, border: `1px solid ${hideMode ? P.gold : P.line}`, borderRadius: R.pill, padding: `${S.sm}px ${S.x2}px` }}>
          <EyeOff size={14} aria-hidden="true" />إخفاء
        </button>
      </div>
      {hideMode && !live && <div style={{ color: P.muted, fontSize: T.xs, marginTop: S.md }}>النصّ مخفي: كل كلمة تقولها صحيحة تظهر، وما فاتك يظهر أحمر.</div>}
      <div style={{ background: P.card, border: `1px solid ${P.line}`, borderRadius: R.x3, padding: S.x4, margin: `${S.x3}px 0`, maxHeight: "50vh", overflowY: "auto" }}>
        <p className="madar-quran" dir="rtl" style={{ margin: 0, fontSize: whole ? "1.45em" : "1.7em", lineHeight: 2.1, textAlign: "justify" }}>
          {ayahs.map((x, i) => (
            <span key={x.a} ref={(el) => { rowRefs.current[x.a] = el; }} style={{ background: whole && current === x.a ? alpha(P.gold, 0.08) : "transparent", borderRadius: R.sm }}>
              <AyahText inline text={x.t} number={x.a} live={live} reveal={hideMode} status={rec.status} cursor={rec.cursor} offset={bounds[i]?.from ?? 0} />
            </span>
          ))}
        </p>
      </div>
      <div aria-live="polite" style={{ minHeight: S.x6, color: P.muted, fontSize: T.sm, textAlign: "center" }}>
        {rec.error || mic.error ? <span style={{ color: C.red }}>{rec.error || mic.error}</span>
          : rec.phase === "connecting" ? "جارٍ فتح قناة التسميع…"
          : finished ? (rec.done && rec.miss === 0 ? "أحسنت، كاملة" : rec.done ? `اكتملت بـ ${num(rec.miss)} كلمة غير مطابقة` : `توقفت عند ${num(heardWords)} من ${num(total)} كلمة`)
          : mic.recording ? `يسمع… ${num(heardWords)} من ${num(total)} كلمة${whole && current ? ` · آية ${num(current)}` : ""}`
          : "اضغط الميكروفون واقرأ"}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: S.x3, margin: `${S.x2}px 0` }}>
        {!whole && (
          <button type="button" onClick={() => audio.toggle("ref", audioUrl(Number(s), Number(a)))} aria-label="استمع للقارئ" className="madar-press"
            style={{ width: TAP, height: TAP, borderRadius: R.pill, background: P.card, border: `1px solid ${P.line}`, color: P.muted, cursor: "pointer", display: "grid", placeItems: "center" }}><Play size={18} aria-hidden="true" /></button>
        )}
        <button type="button" onClick={mic.recording ? stop : start} aria-label={mic.recording ? "أوقف التسجيل" : "ابدأ التسميع"} className="madar-press"
          style={{ width: 72, height: 72, borderRadius: R.pill, border: 0, cursor: "pointer", display: "grid", placeItems: "center", color: P.bg, background: mic.recording ? C.red : P.gold, boxShadow: `0 0 0 ${Math.round(4 + mic.level * 18)}px ${alpha(mic.recording ? C.red : P.gold, 0.25)}`, transition: "box-shadow .1s" }}>
          {mic.recording ? <Square size={26} aria-hidden="true" /> : <Mic size={28} aria-hidden="true" />}
        </button>
      </div>
      {rec.text && mic.recording && <div style={{ color: P.muted, fontSize: T.xs, textAlign: "center", lineHeight: 1.8 }}>سمعتُ: {rec.text}</div>}
      {finished && rows.length > 0 && <ReciteSummary rows={rows} saved={saved} onDecide={decide} />}
      {saved && onNext && <div style={{ marginTop: S.x3 }}><Btn paper onClick={() => { rec.close(); onNext(); }}>{whole ? "السورة التالية" : "الآية التالية"}</Btn></div>}
    </>,
  );
}
