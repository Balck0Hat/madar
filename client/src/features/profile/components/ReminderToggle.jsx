import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { C } from "../../../shared/constants/theme";
import { Btn, Card } from "../../../shared/components/ui";
import { supported, enableReminders, disableReminders } from "../../push/services/push.service";

// تفعيل تذكيرات المراجعة والسلسلة (Web Push) على هذا الجهاز
export default function ReminderToggle({ enabled, onChange, onToast }) {
  const [busy, setBusy] = useState(false);
  const ok = supported();
  const toggle = async () => {
    setBusy(true);
    try {
      if (enabled) { await disableReminders(); await onChange(false); onToast("أُوقفت التذكيرات"); }
      else { await enableReminders(); await onChange(true); onToast("فُعّلت التذكيرات على هذا الجهاز"); }
    } catch (err) { onToast(err.message); } finally { setBusy(false); }
  };
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 800, display: "flex", gap: 8, alignItems: "center" }}>{enabled ? <Bell size={16} color={C.gold} /> : <BellOff size={16} color={C.muted} />}التذكير اليومي</div>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 4, lineHeight: 1.6 }}>{ok ? "مراجعة الصباح في 8:00، وتنبيه السلسلة في 20:00." : "المتصفح لا يدعم الإشعارات؛ ثبّت التطبيق على الشاشة الرئيسية."}</div>
        </div>
        <Btn small full={false} primary={!enabled} disabled={!ok || busy} onClick={toggle}>{busy ? "..." : enabled ? "إيقاف" : "تفعيل"}</Btn>
      </div>
    </Card>
  );
}
