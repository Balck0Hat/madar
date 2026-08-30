import { useState } from "react";
import { C, T } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { TopBar, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { searchUnits } from "../services/search.service";
import { useDebounced } from "../hooks/useDebounced";
import { readRecent, pushRecent, clearRecent } from "../utils/recent";
import SearchInput from "./SearchInput";
import RecentSearches from "./RecentSearches";
import ResultCard from "./ResultCard";

const MIN = 2; // حرفان على الأقل: أقل من ذلك يعيد كل شيء تقريباً

export default function SearchScreen({ onBack, onOpenUnit }) {
  const num = useNum();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(true);
  const [recent, setRecent] = useState(readRecent);
  // الطلب يعتمد على القيمة المؤجّلة (٣٠٠مث)، بينما الحقل يتحدث فوراً
  const [term, setTerm] = useDebounced(text.trim(), 300);
  const enabled = term.length >= MIN;
  const { data, loading, error, reload } = useAsync(() => searchUnits(term), [term], { enabled });

  const remember = (q) => { if (q.length >= MIN) setRecent(pushRecent(q)); };
  const submit = () => { const q = text.trim(); setTerm(q); remember(q); };
  const pick = (q) => { setText(q); setTerm(q); remember(q); };
  const clear = () => { setText(""); setTerm(""); };
  const open = (unitId) => { remember(term); onOpenUnit?.(unitId); };

  const results = data?.results || [];
  const showRecent = !text.trim() && focused;

  return (
    <div className="madar-in" style={{ paddingBottom: 90 }}>
      <TopBar title="البحث" onBack={onBack} />
      <div style={{ padding: "0 16px", display: "grid", gap: 12 }}>
        <SearchInput
          value={text}
          onChange={setText}
          onSubmit={submit}
          onClear={clear}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {showRecent && <RecentSearches items={recent} onPick={pick} onClear={() => setRecent(clearRecent())} />}

        {!enabled && !showRecent && (
          <div style={{ color: C.muted, fontSize: T.base, textAlign: "center", padding: "24px 8px", lineHeight: 1.8 }}>
            اكتب حرفين على الأقل للبحث في عناوين الوحدات وخلاصاتها.
          </div>
        )}

        {/* منطقة النتائج تتغيّر أثناء الكتابة، فنُعلن التغيير لقارئ الشاشة */}
        <div aria-live="polite" aria-busy={loading} style={{ display: "grid", gap: 10 }}>
          {enabled && loading && <Skeleton lines={4} />}
          {enabled && error && <ErrorState message={error.message} onRetry={reload} />}
          {enabled && !loading && !error && !results.length && (
            <EmptyState title="لا نتائج" text={`لم نجد شيئاً يطابق «${term}». جرّب كلمة أعمّ أو اسم المجال.`} />
          )}
          {enabled && !loading && results.length > 0 && (
            <>
              <div style={{ color: C.muted, fontSize: T.sm }}>عدد النتائج {num(results.length)} لـ «{term}»</div>
              {results.map((r, i) => <ResultCard key={`${r.unitId}-${i}`} result={r} onOpen={open} />)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
