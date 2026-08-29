import { useRef, useState } from "react";
import { C, MONO } from "../../../shared/constants/theme";
import { stats } from "../../../shared/utils/progress";
import { levelProgress, levelTitle } from "../../../shared/utils/level";
import { useNum } from "../../../shared/context/NumContext";
import { Bar, Btn, Card, Pill, TopBar } from "../../../shared/components/ui";
import StudyCalendar from "./StudyCalendar";
import BadgeGrid from "./BadgeGrid";
import { ShareSection, CertificateSection, NumToggle, ImagePreview } from "./ProfileCards";
import { svgToPng } from "../utils/svgToPng";

const certCode = (name, year) => `MDR-${year}-${(name.length * 7919 + 4242).toString(36).toUpperCase().slice(0, 5)}`;

export default function ProfileScreen({ profile, progress, xp, badges, streak, studied, arabicNums, onToggleNums, onToast, onLogout }) {
  const num = useNum();
  const { level, cur, need } = levelProgress(xp);
  const st = stats(progress);
  const certRef = useRef(null), shareRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const now = new Date();
  const save = async (ref, w, h) => {
    try {
      setPreview(await svgToPng(ref.current, w, h));
    } catch (err) {
      onToast("تعذّر إنشاء الصورة داخل هذه المعاينة");
    }
  };
  const tiles = [["وحدات", st.units], ["خيوط", st.threads], ["قطاعات", st.sectors], ["سلسلة", streak]];
  return (
    <div className="madar-in" style={{ paddingBottom: 90 }}>
      <TopBar title="أنا" />
      <div style={{ padding: "0 16px", display: "grid", gap: 12 }}>
        <Card>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 99, background: C.gold, color: "#141B33", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 24 }}>{profile.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{profile.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}><Pill>المستوى {num(level)} · {levelTitle(level)}</Pill><Pill color={C.text}>{st.rank}</Pill></div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, margin: "14px 0 6px" }}><span>إلى المستوى {num(level + 1)}</span><span style={{ fontFamily: MONO }}>{num(cur)}/{num(need)}</span></div>
          <Bar value={cur / need} />
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {tiles.map(([l, v]) => (
            <div key={l} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 6px", textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: C.gold }}>{num(v)}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{l}</div>
            </div>
          ))}
        </div>
        <StudyCalendar studied={studied} />
        <ShareSection profile={profile} progress={progress} level={level} st={st} refEl={shareRef} onSave={() => save(shareRef, 360, 640)} />
        <CertificateSection profile={profile} st={st} code={certCode(profile.name, now.getFullYear())} date={now.toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" })} refEl={certRef} onSave={() => save(certRef, 360, 250)} />
        <NumToggle arabicNums={arabicNums} onToggle={onToggleNums} />
        <BadgeGrid badges={badges} />
        <div style={{ color: C.muted, fontSize: 12, textAlign: "center" }}>{profile.email}</div>
        <Btn onClick={onLogout}>تسجيل الخروج</Btn>
      </div>
      <ImagePreview src={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
