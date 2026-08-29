import { useState } from "react";
import { UserPlus } from "lucide-react";
import { C, inputStyle, alpha } from "../../../shared/constants/theme";
import { Btn, Card } from "../../../shared/components/ui";
import { sendRequest } from "../services/friends.service";
import { cleanHandle, validateHandle, addFriendError } from "../utils/friends.utils";

// إضافة صديق بمعرّفه: تحقق فوري في المتصفح ثم رسالة الخادم كما هي إن رفض
export default function AddFriend({ myHandle, onAdded, onToast }) {
  const [value, setValue] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const local = validateHandle(value, myHandle);
    if (local) { setErr(local); return; }
    setBusy(true);
    setErr(null);
    try {
      await sendRequest(cleanHandle(value));
      setValue("");
      onToast?.("أُرسل طلب الصداقة");
      await onAdded?.();
    } catch (error) {
      setErr(addFriendError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <form onSubmit={submit} noValidate>
        <label htmlFor="friend-handle" style={{ fontWeight: 800, fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
          <UserPlus size={16} color={C.gold} />أضف صديقاً بمعرّفه
        </label>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            id="friend-handle"
            value={value}
            onChange={(e) => { setValue(e.target.value); if (err) setErr(null); }}
            onBlur={() => { if (value.trim()) setErr(validateHandle(value, myHandle)); }}
            placeholder="مثال: سالم-a1b2"
            aria-invalid={err ? "true" : "false"}
            aria-describedby={err ? "friend-handle-err" : undefined}
            style={{ ...inputStyle, borderColor: err ? C.red : C.line }}
          />
          <Btn primary full={false} disabled={busy} onClick={submit} style={{ whiteSpace: "nowrap" }}>
            {busy ? "..." : "إرسال"}
          </Btn>
        </div>
        {err && (
          <div id="friend-handle-err" role="alert" style={{ marginTop: 8, fontSize: 13, color: C.red, background: alpha(C.red, 0.12), borderRadius: 10, padding: "8px 10px", lineHeight: 1.6 }}>
            {err}
          </div>
        )}
      </form>
    </Card>
  );
}
