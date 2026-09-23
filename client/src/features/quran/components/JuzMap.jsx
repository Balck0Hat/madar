import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

// خريطة المصحف: ثلاثون مربّعاً، يتلوّن كل جزء بقدر ما أُتقن منه
export default function JuzMap({ juz = [] }) {
  const num = useNum();
  return (
    <div role="img" aria-label="خريطة الأجزاء الثلاثين" style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: S.md }}>
      {juz.map((j) => {
        const ratio = j.total ? j.strong / j.total : 0;
        const started = j.started > 0;
        return (
          <div key={j.juz} title={`الجزء ${j.juz}: أتقنت ${j.strong} من ${j.total} آية`}
            style={{ aspectRatio: "1", borderRadius: R.lg, display: "grid", placeItems: "center", fontSize: T.sm, fontWeight: 700, color: ratio > 0.5 ? C.bg : started ? C.gold : C.muted, border: `1px solid ${started ? C.gold : C.line}`, background: ratio > 0 ? alpha(C.gold, 0.15 + ratio * 0.85) : C.surface2 }}>
            {num(j.juz)}
          </div>
        );
      })}
    </div>
  );
}
