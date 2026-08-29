import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { C, MONO, alpha } from "../../../shared/constants/theme";
import { Btn } from "../../../shared/components/ui";
import { formatDelta, versionDelta } from "../utils/io.utils";

const Delta = ({ value, label }) => {
  const text = formatDelta(value);
  return (
    <span style={{ fontFamily: MONO, color: C.muted }}>
      {label}
      {text && <span style={{ color: value > 0 ? C.green : C.red, marginInlineStart: 4 }}>{text}</span>}
    </span>
  );
};

// صف نسخة واحدة: ماذا تحوي، وكم ستغيّر لو استُعيدت، مع تأكيد داخل الصف لا نافذة متصفح
export default function VersionRow({ version, current, busy, onRestore }) {
  const [confirming, setConfirming] = useState(false);
  const delta = versionDelta(version, current);
  const when = new Date(version.createdAt).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" });
  return (
    <div style={{ background: C.surface2, border: `1px solid ${confirming ? alpha(C.gold, 0.5) : C.line}`, borderRadius: 14, padding: 12, display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 800, fontFamily: MONO, color: C.gold }}>#{version.version}</span>
        <span style={{ fontSize: 12, color: C.muted }}>{when}</span>
        {version.editedBy && <span style={{ fontSize: 12, color: C.muted }}>· {version.editedBy}</span>}
        <span style={{ flex: 1 }} />
        {!confirming && (
          <Btn small full={false} disabled={busy} onClick={() => setConfirming(true)}>
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><RotateCcw size={14} />استعادة</span>
          </Btn>
        )}
      </div>
      <div style={{ fontSize: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Delta value={delta.cards} label={`${version.cards} بطاقة`} />
        <Delta value={delta.questions} label={`${version.questions} سؤالاً`} />
        {version.note && <span style={{ color: C.muted }}>· {version.note}</span>}
      </div>
      {confirming && (
        <div role="group" aria-label={`تأكيد استعادة النسخة ${version.version}`} style={{ display: "grid", gap: 8, background: alpha(C.gold, 0.1), border: `1px solid ${alpha(C.gold, 0.35)}`, borderRadius: 12, padding: 10 }}>
          <div style={{ fontSize: 13, lineHeight: 1.7 }}>
            ستحلّ هذه النسخة محل المحتوى الحالي. الحالة الحالية تُحفظ نسخةً جديدة، فيمكنك التراجع.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn primary small full={false} disabled={busy} onClick={() => onRestore(version.version)}>{busy ? "لحظة..." : "تأكيد الاستعادة"}</Btn>
            <Btn ghost small full={false} disabled={busy} onClick={() => setConfirming(false)}>إلغاء</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
