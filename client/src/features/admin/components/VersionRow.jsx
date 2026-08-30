import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { C, MONO, alpha, T, R, S } from "../../../shared/constants/theme";
import { Btn } from "../../../shared/components/ui";
import { formatDelta, versionDelta } from "../utils/io.utils";

const Delta = ({ value, label }) => {
  const text = formatDelta(value);
  return (
    <span style={{ fontFamily: MONO, color: C.muted }}>
      {label}
      {text && <span style={{ color: value > 0 ? C.green : C.red, marginInlineStart: S.sm }}>{text}</span>}
    </span>
  );
};

// صف نسخة واحدة: ماذا تحوي، وكم ستغيّر لو استُعيدت، مع تأكيد داخل الصف لا نافذة متصفح
export default function VersionRow({ version, current, busy, onRestore }) {
  const [confirming, setConfirming] = useState(false);
  const delta = versionDelta(version, current);
  const when = new Date(version.createdAt).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" });
  return (
    <div style={{ background: C.surface2, border: `1px solid ${confirming ? alpha(C.gold, 0.5) : C.line}`, borderRadius: R.xl, padding: S.x2, display: "grid", gap: S.lg }}>
      <div style={{ display: "flex", alignItems: "center", gap: S.lg, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontFamily: MONO, color: C.gold }}>#{version.version}</span>
        <span style={{ fontSize: T.sm, color: C.muted }}>{when}</span>
        {version.editedBy && <span style={{ fontSize: T.sm, color: C.muted }}>· {version.editedBy}</span>}
        <span style={{ flex: 1 }} />
        {!confirming && (
          <Btn small full={false} disabled={busy} onClick={() => setConfirming(true)}>
            <span style={{ display: "inline-flex", gap: S.md, alignItems: "center" }}><RotateCcw size={14} />استعادة</span>
          </Btn>
        )}
      </div>
      <div style={{ fontSize: T.sm, display: "flex", gap: S.x2, flexWrap: "wrap" }}>
        <Delta value={delta.cards} label={`${version.cards} بطاقة`} />
        <Delta value={delta.questions} label={`${version.questions} سؤالاً`} />
        {version.note && <span style={{ color: C.muted }}>· {version.note}</span>}
      </div>
      {confirming && (
        <div role="group" aria-label={`تأكيد استعادة النسخة ${version.version}`} style={{ display: "grid", gap: S.lg, background: alpha(C.gold, 0.1), border: `1px solid ${alpha(C.gold, 0.35)}`, borderRadius: R.lg, padding: S.xl }}>
          <div style={{ fontSize: T.base, lineHeight: 1.7 }}>
            ستحلّ هذه النسخة محل المحتوى الحالي. الحالة الحالية تُحفظ نسخةً جديدة، فيمكنك التراجع.
          </div>
          <div style={{ display: "flex", gap: S.lg }}>
            <Btn primary small full={false} disabled={busy} onClick={() => onRestore(version.version)}>{busy ? "لحظة..." : "تأكيد الاستعادة"}</Btn>
            <Btn ghost small full={false} disabled={busy} onClick={() => setConfirming(false)}>إلغاء</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
