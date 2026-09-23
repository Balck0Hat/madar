import { useEffect, useState } from "react";
import { Mic, Square, Play } from "lucide-react";
import { C, P, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import { getSura, reviewAyah, audioUrl } from "../services/quran.service";
import { useRecorder } from "../hooks/useRecorder";
import { useRecite } from "../hooks/useRecite";
import { useAudio } from "../hooks/useAudio";
import AyahText from "./AyahText";

// التسميع المباشر: اضغط الميكروفون واقرأ؛ الكلمات تتلوّن وأنت تقرأ (نحو ثانيتين
// تأخيراً). الآية تكتمل خضراء فتُسجَّل صحيحة في جدول المراجعة؛ وبأحمر فيها
// تُعرض عليك النتيجة وتقرّر أنت. الصوت لا يُحفظ في أي مكان.
export default function ReciteScreen({ s, a, onBack, onNext }) {
  const num = useNum();
  const rec = useRecite();
  const mic = useRecorder(rec.push);
  const audio = useAudio();
  const [saved, setSaved] = useState(null);
  const { data, loading, error, reload } = useAsync(() => getSura(s).then((sura) => ({ sura, ayah: sura.ayahs.find((x) => x.a === Number(a)) })), [s, a]);
  const ayah = data?.ayah;

  const start = async () => { setSaved(null); try { await rec.begin(Number(s), Number(a)); await mic.start(); } catch { /* الخطأ يُعرض من الخطّاف */ } };
  const stop = () => { mic.stop(); rec.finish(); };
  useEffect(() => { if (rec.phase === "done") { mic.stop(); if (rec.miss === 0) reviewAyah(Number(s), Number(a), true).then(() => setSaved("ok")).catch(() => {}); } }, [rec.phase]); // eslint-disable-line react-hooks/exhaustive-deps
  const decide = (correct) => reviewAyah(Number(s), Number(a), correct).then(() => setSaved(correct ? "ok" : "miss")).catch(() => {});

  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.ink, "--unit-color": P.gold }}>
      <TopBar paper title={<span style={{ fontSize: T.lg }}>تسميع</span>} onBack={() => { stop(); rec.close(); onBack(); }} />
      <div className="madar-read" style={{ padding: `${S.lg}px ${S.x5}px ${S.x8}px` }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton paper lines={5} />);
  if (error || !ayah) return shell(<ErrorState message={error?.message || "الآية غير متاحة"} onRetry={reload} onBack={onBack} />);

  const live = rec.status.length > 0;
  const finished = rec.phase === "done" || (live && !mic.recording); // انتهت من الخادم، أو أوقفها القارئ بنفسه
  return shell(
    <>
      <div style={{ color: P.muted, fontSize: T.sm, textAlign: "center" }}>سورة {data.sura.name} · آية {num(ayah.a)}</div>
      <div style={{ background: P.card, border: `1px solid ${P.line}`, borderRadius: R.x3, padding: S.x4, margin: `${S.x3}px 0` }}>
        <AyahText text={ayah.t} number={ayah.a} live={live} status={rec.status} cursor={rec.cursor} size="1.7em" />
      </div>
      <div aria-live="polite" style={{ minHeight: S.x6, color: P.muted, fontSize: T.sm, textAlign: "center" }}>
        {rec.error || mic.error ? <span style={{ color: C.red }}>{rec.error || mic.error}</span>
          : rec.phase === "connecting" ? "جارٍ فتح قناة التسميع…"
          : finished ? (rec.miss === 0 && rec.done ? "أحسنت، الآية كاملة" : rec.done ? `اكتملت بـ ${num(rec.miss)} كلمة غير مطابقة` : `توقفت عند ${num(rec.ok)} من ${num(rec.status.length)} كلمة`)
          : mic.recording ? `يسمع… ${num(rec.ok)} من ${num(rec.status.length || "؟")} كلمة`
          : "اضغط الميكروفون واقرأ الآية"}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: S.x3, margin: `${S.x2}px 0` }}>
        <button type="button" onClick={() => audio.toggle("ref", audioUrl(ayah.s, ayah.a))} aria-label="استمع للقارئ" className="madar-press"
          style={{ width: TAP, height: TAP, borderRadius: R.pill, background: P.card, border: `1px solid ${P.line}`, color: P.muted, cursor: "pointer", display: "grid", placeItems: "center" }}><Play size={18} aria-hidden="true" /></button>
        <button type="button" onClick={mic.recording ? stop : start} aria-label={mic.recording ? "أوقف التسجيل" : "ابدأ التسميع"} className="madar-press"
          style={{ width: 72, height: 72, borderRadius: R.pill, border: 0, cursor: "pointer", display: "grid", placeItems: "center", color: P.bg, background: mic.recording ? C.red : P.gold, boxShadow: `0 0 0 ${Math.round(4 + mic.level * 18)}px ${alpha(mic.recording ? C.red : P.gold, 0.25)}`, transition: "box-shadow .1s" }}>
          {mic.recording ? <Square size={26} aria-hidden="true" /> : <Mic size={28} aria-hidden="true" />}
        </button>
      </div>
      {rec.text && <div style={{ color: P.muted, fontSize: T.xs, textAlign: "center", lineHeight: 1.8 }}>سمعتُ: {rec.text}</div>}
      {finished && saved === null && !(rec.done && rec.miss === 0) && (
        <div style={{ display: "flex", gap: S.lg, marginTop: S.x3 }}>
          <Btn primary color={C.green} style={{ color: P.bg }} onClick={() => decide(true)}>كانت صحيحة</Btn>
          <Btn paper onClick={() => decide(false)}>أخطأت، أعدها غداً</Btn>
        </div>
      )}
      {saved && <div style={{ textAlign: "center", color: saved === "ok" ? C.green : C.red, fontWeight: 700, marginTop: S.x2 }}>{saved === "ok" ? "سُجّلت صحيحة، تعود إليك في موعدها" : "سُجّلت، تعود إليك غداً"}</div>}
      {saved && onNext && <div style={{ marginTop: S.x3 }}><Btn paper onClick={() => { rec.close(); onNext(); }}>الآية التالية</Btn></div>}
    </>,
  );
}
