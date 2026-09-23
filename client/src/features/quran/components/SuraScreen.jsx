import { useState } from "react";
import { Mic, Headphones } from "lucide-react";
import { P, R, S, T, TAP, alpha, inputStyle } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState } from "../../../shared/components/ui";
import { getSura, getMemo, reviewAyah, keyOf } from "../services/quran.service";
import { useAudio } from "../hooks/useAudio";
import AyahCard from "./AyahCard";

const HIDES = [["none", "عرض"], ["third", "أخفِ الثلث"], ["half", "أخفِ النصف"], ["all", "أخفِ الكل"]];

// سورة كاملة للحفظ: وضع الإخفاء للسورة كلها، وكل آية ببطاقتها. «أتقنتها/أخطأت»
// يحدّثان جدول المراجعة فوراً.
export default function SuraScreen({ n, onBack, onRecite, onReciteAll, onReciteRange, onListen, onNext }) {
  const num = useNum();
  const [hide, setHide] = useState("none");
  const [items, setItems] = useState({});
  const [rng, setRng] = useState({ from: 1, to: 1 });
  const audio = useAudio();
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([getSura(n), getMemo().catch(() => ({ items: {} }))]).then(([sura, memo]) => { setItems(memo.items || {}); return sura; }),
    [n],
  );

  const review = async (ayah, correct) => {
    const item = await reviewAyah(ayah.s, ayah.a, correct).catch(() => null);
    if (item) setItems((m) => ({ ...m, [keyOf(ayah.s, ayah.a)]: item }));
  };

  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.ink, "--unit-color": P.gold }}>
      <TopBar paper title={<span style={{ fontSize: T.lg }}>{data ? `سورة ${data.name}` : "المصحف"}</span>} onBack={onBack} />
      <div className="madar-read" style={{ padding: `${S.lg}px ${S.x5}px ${S.x8}px` }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton paper lines={6} />);
  if (error || !data) return shell(<ErrorState message={error?.message || "السورة غير متاحة"} onRetry={reload} onBack={onBack} />);

  const learned = data.ayahs.filter((a) => items[keyOf(a.s, a.a)]).length;
  return shell(
    <>
      <div style={{ textAlign: "center", color: P.muted, fontSize: T.sm }}>
        {data.revelation} · {num(data.ayahs.length)} آية · تبدأ في الصفحة {num(data.page)} · بدأت حفظ {num(learned)} منها
      </div>
      <div role="tablist" aria-label="وضع العرض" style={{ display: "flex", gap: S.md, margin: `${S.x3}px 0 ${S.x2}px`, overflowX: "auto" }}>
        {HIDES.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={hide === k} onClick={() => setHide(k)}
            style={{ flexShrink: 0, minHeight: TAP, fontFamily: "inherit", fontSize: T.sm, fontWeight: 700, padding: `${S.md}px ${S.x3}px`, borderRadius: R.pill, cursor: "pointer", background: hide === k ? alpha(P.gold, 0.16) : P.card, color: hide === k ? P.gold : P.muted, border: `1px solid ${hide === k ? P.gold : P.line}` }}>
            {label}
          </button>
        ))}
      </div>
      {hide !== "none" && <div style={{ color: P.muted, fontSize: T.xs, marginBottom: S.md }}>اضغط على أي فراغ لتكشف كلمته.</div>}
      {onReciteAll && (
        <div style={{ display: "grid", gap: S.lg, margin: `${S.md}px 0 ${S.x2}px`, background: P.card, border: `1px solid ${P.line}`, borderRadius: R.x2, padding: S.x3 }}>
          <div style={{ display: "flex", gap: S.lg }}>
            <button type="button" onClick={() => onReciteAll(data.n)} className="madar-press" style={{ flex: 1, minHeight: TAP, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", color: P.bg, background: P.gold, border: 0, borderRadius: R.xl, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: S.md }}><Mic size={16} aria-hidden="true" />سمّع السورة كاملة</button>
            {onListen && <button type="button" onClick={() => onListen(data.n)} className="madar-press" style={{ flex: 1, minHeight: TAP, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", color: P.gold, background: alpha(P.gold, 0.1), border: `1px solid ${P.gold}`, borderRadius: R.xl, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: S.md }}><Headphones size={16} aria-hidden="true" />استمع كاملة</button>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: S.md, flexWrap: "wrap" }}>
            <span style={{ color: P.muted, fontSize: T.sm }}>أو من آية</span>
            <input type="number" min={1} max={data.ayahs.length} value={rng.from} aria-label="من آية" onChange={(e) => setRng((r) => ({ ...r, from: Math.max(1, Math.min(data.ayahs.length, Number(e.target.value) || 1)) }))} style={{ ...inputStyle, width: 64, minHeight: TAP, padding: `0 ${S.lg}px`, textAlign: "center" }} />
            <span style={{ color: P.muted, fontSize: T.sm }}>إلى</span>
            <input type="number" min={1} max={data.ayahs.length} value={rng.to} aria-label="إلى آية" onChange={(e) => setRng((r) => ({ ...r, to: Math.max(1, Math.min(data.ayahs.length, Number(e.target.value) || 1)) }))} style={{ ...inputStyle, width: 64, minHeight: TAP, padding: `0 ${S.lg}px`, textAlign: "center" }} />
            <button type="button" disabled={rng.to < rng.from} onClick={() => onReciteRange?.(data.n, rng.from, rng.to)} className="madar-press" style={{ minHeight: TAP, fontFamily: "inherit", fontSize: T.sm, fontWeight: 700, cursor: "pointer", color: P.gold, background: "none", border: `1px solid ${P.line}`, borderRadius: R.pill, padding: `0 ${S.x2}px` }}>سمّع المدى</button>
            {onListen && <button type="button" disabled={rng.to < rng.from} onClick={() => onListen(data.n, rng.from, rng.to)} className="madar-press" style={{ minHeight: TAP, fontFamily: "inherit", fontSize: T.sm, fontWeight: 700, cursor: "pointer", color: P.gold, background: "none", border: `1px solid ${P.line}`, borderRadius: R.pill, padding: `0 ${S.x2}px` }}>استمع للمدى</button>}
          </div>
        </div>
      )}
      {data.n !== 9 && data.n !== 1 && <p className="madar-quran" dir="rtl" style={{ textAlign: "center", fontSize: "1.4em", margin: `${S.x2}px 0`, color: P.muted }}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</p>}
      {data.ayahs.map((a) => <AyahCard key={a.a} ayah={a} hide={hide} item={items[keyOf(a.s, a.a)]} audio={audio} onReview={review} onRecite={onRecite} />)}
      {onNext && data.n < 114 && (
        <button type="button" onClick={() => onNext(data.n + 1)} className="madar-press" style={{ width: "100%", minHeight: TAP, marginTop: S.x5, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", color: P.gold, background: alpha(P.gold, 0.1), border: `1px solid ${P.gold}`, borderRadius: R.x2 }}>
          السورة التالية
        </button>
      )}
    </>,
  );
}
