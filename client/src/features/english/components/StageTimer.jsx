import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

// مؤقّت الجزء: يحسب من وقت البدء المخزَّن في الخادم (فالتحديث لا يعيده)، ويصحّح فرق
// الساعتين بقيمة now التي أرسلها الخادم. آخر دقيقة بالأحمر، وعند الصفر يُبلَّغ مرة واحدة.
export default function StageTimer({ timer, onExpire }) {
  const num = useNum();
  const offset = useRef(Date.now() - (timer?.now || Date.now()));
  const fired = useRef(false);
  const end = timer?.startedAt ? new Date(timer.startedAt).getTime() + timer.budget * 1000 : null;
  const calc = () => (end === null ? null : Math.max(0, Math.round((end - (Date.now() - offset.current)) / 1000)));
  const [left, setLeft] = useState(calc);
  useEffect(() => { fired.current = false; offset.current = Date.now() - (timer?.now || Date.now()); setLeft(calc()); }, [timer?.startedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (end === null) return undefined;
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [end]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (left === 0 && !fired.current) { fired.current = true; onExpire?.(); } }, [left, onExpire]);
  if (left === null) return null;
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  const urgent = left <= 60;
  const pct = Math.round((left / timer.budget) * 100);
  return (
    <div role="timer" aria-live={urgent ? "polite" : "off"} aria-label={`الوقت المتبقي ${mm}:${ss}`}
      style={{ display: "flex", alignItems: "center", gap: S.lg, color: urgent ? C.red : C.muted, fontSize: T.sm }}>
      <Clock size={14} aria-hidden="true" />
      <span className="madar-num" style={{ fontWeight: 700, minWidth: 44 }}>{num(mm)}:{num(ss)}</span>
      <span aria-hidden="true" style={{ flex: 1, height: 4, borderRadius: R.pill, background: alpha(urgent ? C.red : C.gold, 0.15), overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: `${pct}%`, background: urgent ? C.red : C.gold, transition: "width 1s linear" }} />
      </span>
    </div>
  );
}
