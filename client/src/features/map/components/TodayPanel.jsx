import { Snowflake, RotateCcw } from "lucide-react";
import { C, T, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { Card, Pill } from "../../../shared/components/ui";
import { ChallengeCard } from "../../challenge";
import StatsRow from "./StatsRow";

// محتوى شريط «اليوم» بعد فتحه: كل ما كان يزاحم الفعل الأساسي، مجموعاً في مكان واحد
// يُفتح بإرادة المتعلّم. في وضع الهدوء يبقى منه ما يخدم التعلّم (المراجعة) فقط.
export default function TodayPanel({ streak, weeklyXp, freezes = 0, reviewDue = 0, calm = false, onReview, onToast }) {
  const num = useNum();
  return (
    <div className="madar-in" style={{ display: "grid", gap: S.xl, marginTop: S.xl }}>
      {!calm && <StatsRow streak={streak} weeklyXp={weeklyXp} />}

      {!calm && freezes > 0 && (
        <div style={{ color: C.muted, fontSize: T.sm, display: "flex", gap: S.md, alignItems: "center" }}>
          <Snowflake size={13} color="#52B8E8" aria-hidden="true" />
          لديك {num(freezes)} تجميد للسلسلة: يحفظها إذا فاتك يوم.
        </div>
      )}

      {reviewDue > 0 && (
        // Card لا يقبل className فنلفّها بغلاف يحمل تأثير الضغط
        <div className="madar-press">
          <Card accent={C.gold} onClick={onReview}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: S.lg }}>
              <div>
                <div style={{ fontWeight: 700, display: "flex", gap: S.lg, alignItems: "center" }}>
                  <RotateCcw size={16} color={C.gold} aria-hidden="true" />مراجعة الصباح
                </div>
                <div style={{ color: C.muted, fontSize: T.base, marginTop: S.sm }}>
                  {num(reviewDue)} وحدات مستحقة · 3 دقائق تثبّت ما تعلمته
                </div>
              </div>
              <Pill>+{num(10)} لكل وحدة</Pill>
            </div>
          </Card>
        </div>
      )}

      {/* تحدي اليوم لعبة يومية لا تعلّماً؛ وضع الهدوء يخفيه بالكامل */}
      {!calm && <ChallengeCard onToast={onToast} />}
    </div>
  );
}
