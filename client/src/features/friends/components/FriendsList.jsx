import { useState } from "react";
import { Zap, Flame } from "lucide-react";
import { C, MONO, T, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { Btn } from "../../../shared/components/ui";
import PersonRow from "./PersonRow";
import { removeFriend } from "../services/friends.service";

// الحذف إجراء لا رجعة فيه: تأكيد داخل الصف نفسه بدل نافذة المتصفح
export default function FriendsList({ friends, onChanged, onToast }) {
  const num = useNum();
  const [confirmId, setConfirmId] = useState(null);
  const [busy, setBusy] = useState(null);

  const remove = async (id) => {
    if (busy) return;
    setBusy(id);
    try {
      await removeFriend(id);
      setConfirmId(null);
      onToast?.("أُزيل من قائمة أصدقائك");
      await onChanged?.();
    } catch (err) {
      onToast?.(err.message || "تعذّر الحذف");
    } finally {
      setBusy(null);
    }
  };

  if (!friends.length) return null;
  return (
    <div style={{ display: "grid", gap: S.lg }}>
      <div style={{ fontWeight: 700, fontSize: T.md, margin: `${S.sm}px 0 ${S.xs}px` }}>أصدقاؤك ({num(friends.length)})</div>
      {friends.map((f) => (
        <PersonRow
          key={f.id}
          person={f}
          sub={
            <span style={{ display: "inline-flex", gap: S.xl, alignItems: "center", fontFamily: MONO }}>
              <span><Zap size={11} style={{ verticalAlign: "-1px" }} /> {num(f.weeklyXp ?? 0)} هذا الأسبوع</span>
              {f.streak > 0 && <span><Flame size={11} style={{ verticalAlign: "-1px" }} /> {num(f.streak)}</span>}
            </span>
          }
        >
          {confirmId === f.id ? (
            <>
              <span style={{ color: C.red, fontSize: T.sm, fontWeight: 600 }}>حذف؟</span>
              <Btn primary color={C.red} small full={false} disabled={busy === f.id} onClick={() => remove(f.id)}>نعم</Btn>
              <Btn small full={false} onClick={() => setConfirmId(null)}>تراجع</Btn>
            </>
          ) : (
            <Btn small full={false} onClick={() => setConfirmId(f.id)} style={{ color: C.muted }}>إزالة</Btn>
          )}
        </PersonRow>
      ))}
    </div>
  );
}
