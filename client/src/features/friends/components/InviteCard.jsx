import { useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { C, MONO, alpha } from "../../../shared/constants/theme";
import { Btn, Card } from "../../../shared/components/ui";
import { shareLink } from "../utils/friends.utils";

// رابط المشاركة: نسخ عبر الحافظة، وإن مُنعت نحدّد النص ليُنسخ يدوياً
export default function InviteCard({ myHandle, onToast }) {
  const link = shareLink(myHandle);
  const boxRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const selectText = () => {
    const node = boxRef.current;
    if (!node || typeof window === "undefined" || !window.getSelection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      onToast?.("نُسخ الرابط");
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      selectText();
      onToast?.("انسخ الرابط المحدد يدوياً");
    }
  };

  return (
    <Card accent={C.gold}>
      <div style={{ fontWeight: 800, fontSize: 14 }}>ادعُ أصدقاءك</div>
      <div style={{ color: C.muted, fontSize: 13, marginTop: 4, lineHeight: 1.7 }}>
        شارك رابطك، ومن يفتحه يرى معرّفك ويضيفك بضغطة.
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
        <div
          ref={boxRef}
          dir="ltr"
          style={{ flex: 1, minWidth: 0, fontFamily: MONO, fontSize: 12, background: alpha(C.gold, 0.1), border: `1px solid ${alpha(C.gold, 0.3)}`, borderRadius: 12, padding: "10px 12px", overflowX: "auto", whiteSpace: "nowrap", textAlign: "left" }}
        >
          {link}
        </div>
        <Btn full={false} small onClick={copy} style={{ whiteSpace: "nowrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {copied ? <Check size={14} color={C.green} /> : <Copy size={14} />}
            {copied ? "نُسخ" : "نسخ"}
          </span>
        </Btn>
      </div>
    </Card>
  );
}
