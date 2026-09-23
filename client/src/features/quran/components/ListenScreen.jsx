import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, Repeat, Shuffle } from "lucide-react";
import { P, R, S, T, TAP, alpha, C } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState } from "../../../shared/components/ui";
import { listSuras, getSura, audioUrl } from "../services/quran.service";
import AyahText from "./AyahText";

const pick = (n) => Math.floor(Math.random() * n);

// استماع متصل: سورة، أو من آية إلى آية، أو عشوائي من المصحف كله. يكرّر حتى
// توقفه أنت، والآية التي تُسمع تُعرض بنصّها. آية عشوائية تعني آية بعدها ما يليها
// حتى نهاية سورتها القصيرة، أو خمس آيات من الطويلة، ثم قفزة جديدة.
export default function ListenScreen({ mode, n, from, to, onBack }) {
  const num = useNum();
  const [loop, setLoop] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [i, setI] = useState(0);
  const [queue, setQueue] = useState([]);
  const el = useRef(null);
  const { data, loading, error, reload } = useAsync(async () => {
    if (mode === "random") return { suras: await listSuras(), cache: {} };
    const sura = await getSura(n);
    return { sura, ayahs: sura.ayahs.filter((x) => !from || (x.a >= from && x.a <= to)) };
  }, [mode, n, from, to]);

  // عشوائي: جملة من آيات متتالية من سورة عشوائية
  const randomRun = async () => {
    const s = data.suras[pick(data.suras.length)];
    const sura = data.cache[s.n] || (data.cache[s.n] = await getSura(s.n));
    const start = pick(sura.ayahs.length);
    return sura.ayahs.slice(start, start + (sura.ayahs.length <= 20 ? sura.ayahs.length : 5)).map((x) => ({ ...x, suraName: sura.name }));
  };
  useEffect(() => {
    if (!data) return;
    if (mode === "random") randomRun().then((q) => { setQueue(q); setI(0); });
    else { setQueue(data.ayahs.map((x) => ({ ...x, suraName: data.sura.name }))); setI(0); }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = queue[i];
  useEffect(() => {
    if (!cur || !playing) return;
    const a = el.current || (el.current = new Audio());
    a.src = audioUrl(cur.s, cur.a);
    a.onended = () => next();
    a.onerror = () => next();
    a.play().catch(() => setPlaying(false));
  }, [cur, playing]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { el.current?.pause(); }, []);

  const next = async () => {
    if (i + 1 < queue.length) { setI(i + 1); return; }
    if (mode === "random") { const q = await randomRun(); setQueue(q); setI(0); return; }
    if (loop) setI(0); else { setPlaying(false); el.current?.pause(); }
  };
  const toggle = () => { if (playing) { el.current?.pause(); setPlaying(false); } else setPlaying(true); };

  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.ink, "--unit-color": P.gold }}>
      <TopBar paper title={<span style={{ fontSize: T.lg }}>استماع</span>} onBack={() => { el.current?.pause(); onBack(); }} />
      <div className="madar-read" style={{ padding: `${S.lg}px ${S.x5}px ${S.x8}px` }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton paper lines={5} />);
  if (error || !data) return shell(<ErrorState message={error?.message || "غير متاح"} onRetry={reload} onBack={onBack} />);

  const label = mode === "random" ? "عشوائي من المصحف كله" : from ? `سورة ${data.sura.name} · من ${num(from)} إلى ${num(to)}` : `سورة ${data.sura.name} كاملة`;
  const Ctl = ({ Icon, on, onClick, aria, big }) => (
    <button type="button" onClick={onClick} aria-label={aria} aria-pressed={on} className="madar-press"
      style={{ width: big ? 72 : TAP, height: big ? 72 : TAP, borderRadius: R.pill, border: big ? 0 : `1px solid ${on ? P.gold : P.line}`, cursor: "pointer", display: "grid", placeItems: "center", color: big ? P.bg : on ? P.gold : P.muted, background: big ? P.gold : on ? alpha(P.gold, 0.14) : P.card }}>
      <Icon size={big ? 28 : 18} aria-hidden="true" />
    </button>
  );
  return shell(
    <>
      <div style={{ color: P.muted, fontSize: T.sm, textAlign: "center" }}>{label}</div>
      <div style={{ background: P.card, border: `1px solid ${P.line}`, borderRadius: R.x3, padding: S.x4, margin: `${S.x3}px 0`, minHeight: 160 }}>
        {cur ? (
          <>
            <div style={{ color: P.muted, fontSize: T.xs, marginBottom: S.md }}>سورة {cur.suraName} · آية {num(cur.a)} · {num(i + 1)} من {num(queue.length)}</div>
            <AyahText text={cur.t} number={cur.a} size="1.6em" />
          </>
        ) : <Skeleton paper lines={3} />}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: S.x3 }}>
        {mode !== "random" && <Ctl Icon={Repeat} on={loop} onClick={() => setLoop((v) => !v)} aria="تكرار" />}
        {mode === "random" && <Ctl Icon={Shuffle} on onClick={() => {}} aria="عشوائي" />}
        <Ctl Icon={playing ? Pause : Play} big onClick={toggle} aria={playing ? "إيقاف" : "تشغيل"} />
        <Ctl Icon={SkipForward} onClick={next} aria="التالية" />
      </div>
      <div style={{ color: P.muted, fontSize: T.xs, textAlign: "center", marginTop: S.x3, lineHeight: 1.7 }}>
        {mode === "random" ? "لا يتوقف حتى توقفه: بعد كل مقطع يقفز إلى موضع جديد من المصحف." : loop ? "يعيد من البداية حين ينتهي، حتى توقفه." : "يتوقف حين ينتهي."} القارئ مشاري العفاسي.
      </div>
      <div style={{ color: C.muted, fontSize: T.xs, textAlign: "center", marginTop: S.md }}>إن لم يبدأ الصوت تلقائياً فاضغط تشغيل مرة واحدة: المتصفح يشترط ضغطة.</div>
    </>,
  );
}
