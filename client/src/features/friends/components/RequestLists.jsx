import { useState } from "react";
import { C, T, S } from "../../../shared/constants/theme";
import { Btn } from "../../../shared/components/ui";
import PersonRow from "./PersonRow";
import { acceptRequest, dropRequest } from "../services/friends.service";

const Head = ({ children }) => (
  <div style={{ fontWeight: 700, fontSize: T.md, margin: `${S.sm}px 0 ${S.xs}px` }}>{children}</div>
);

// الطلبات الواردة والصادرة: كل زر يقفل نفسه أثناء التنفيذ حتى لا يُرسل مرتين
export default function RequestLists({ incoming, outgoing, onChanged, onToast }) {
  const [busy, setBusy] = useState(null);

  const run = async (id, action, msg) => {
    if (busy) return;
    setBusy(id);
    try {
      await action(id);
      onToast?.(msg);
      await onChanged?.();
    } catch (err) {
      onToast?.(err.message || "تعذّر تنفيذ الطلب");
    } finally {
      setBusy(null);
    }
  };

  if (!incoming.length && !outgoing.length) return null;
  return (
    <div style={{ display: "grid", gap: S.lg }}>
      {incoming.length > 0 && <Head>طلبات واردة</Head>}
      {incoming.map((p) => (
        <PersonRow key={p.id} person={p} sub={p.handle}>
          <Btn primary small full={false} disabled={busy === p.id} onClick={() => run(p.id, acceptRequest, "صرتما صديقين")}>قبول</Btn>
          <Btn small full={false} disabled={busy === p.id} onClick={() => run(p.id, dropRequest, "رُفض الطلب")}>رفض</Btn>
        </PersonRow>
      ))}
      {outgoing.length > 0 && <Head>طلبات بانتظار الرد</Head>}
      {outgoing.map((p) => (
        <PersonRow key={p.id} person={p} sub={p.handle}>
          <span style={{ color: C.muted, fontSize: T.sm }}>معلّق</span>
          <Btn small full={false} disabled={busy === p.id} onClick={() => run(p.id, dropRequest, "أُلغي الطلب")}>إلغاء</Btn>
        </PersonRow>
      ))}
    </div>
  );
}
