import { useState } from "react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import { getCalibration, runCalibration } from "../services/english.service";

function Rows({ title, rows, empty }) {
  const num = useNum();
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.lg }}>
      <div style={{ fontWeight: 700 }}>{title}</div>
      {rows.length ? rows.map((r) => (
        <div key={r.itemId} style={{ display: "grid", gap: S.xs, fontSize: T.sm, borderInlineStart: `3px solid ${alpha(r.override ? C.gold : C.line, 0.8)}`, paddingInlineStart: S.x2 }}>
          <div style={{ display: "flex", gap: S.lg, flexWrap: "wrap" }}>
            <span className="madar-num" style={{ color: C.muted }}>{r.itemId}</span>
            <span>{r.level}{r.override ? ` ← ${r.override}` : ""}</span>
            <span className="madar-num">{num(r.rate)}٪ من {num(r.asked)}</span>
          </div>
          {r.q && <div dir="ltr" style={{ textAlign: "left", fontFamily: "Georgia, serif", color: C.muted }}>{r.q}</div>}
        </div>
      )) : <div style={{ color: C.muted, fontSize: T.sm }}>{empty}</div>}
    </div>
  );
}

// لوحة معايرة بنك الأسئلة (للمشرف): ما تغيّر مستواه، وما يخطئ فيه الجميع أو يصيبه الجميع، وتشغيل المعايرة الآن
export default function CalibrationScreen({ onBack }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(() => getCalibration(), []);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const run = async () => { setBusy(true); setMsg(""); try { const r = await runCalibration(); setMsg(`رُوجع ${num(r.run.reviewed)} سؤالاً، تغيّر ${num(r.run.changed)} (صعد ${num(r.run.up)}، نزل ${num(r.run.down)}).`); reload(); } catch (e) { setMsg(e.message); } finally { setBusy(false); } };
  const shell = (children) => (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="معايرة بنك الإنجليزية" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={6} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);
  return shell(
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: S.lg }}>
        {[["أسئلة لها بيانات", data.tracked], ["مستوى معاير", data.active], ["حدّ المعايرة", data.minAsked]].map(([l, v]) => (
          <div key={l} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x2, textAlign: "center" }}>
            <div className="madar-num" style={{ fontWeight: 700, fontSize: T.x3 }}>{num(v)}</div><div style={{ color: C.muted, fontSize: T.xs }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.7 }}>
        تعمل ليلاً في 3:30. آخر تشغيل: {data.lastRun ? num(new Date(data.lastRun).toLocaleString("ar")) : "لم تعمل بعد منذ الإقلاع"}. حسب المستوى: {Object.entries(data.perLevel).map(([l, s]) => `${l} ${num(s.asked)} إجابة`).join(" · ") || "لا شيء بعد"}.
      </div>
      <Btn primary onClick={run} disabled={busy}>{busy ? "جارٍ…" : "شغّل المعايرة الآن"}</Btn>
      {msg && <div role="status" style={{ color: C.gold, fontSize: T.sm }}>{msg}</div>}
      <Rows title="أسئلة تغيّر مستواها" rows={data.overridden} empty="لا شيء بعد؛ يلزم 30 إجابة على السؤال." />
      <Rows title="أصعب مما كُتب (أقل من 35٪ بعد 10 إجابات)" rows={data.hardest} empty="لا شيء بعد." />
      <Rows title="أسهل مما كُتب (أكثر من 90٪ بعد 10 إجابات)" rows={data.easiest} empty="لا شيء بعد." />
    </>,
  );
}
