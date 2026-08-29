import { useAsync } from "../../../shared/hooks/useAsync";
import { TopBar, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { startAttempt } from "../services/quizAttempt.service";
import QuizRunner from "./QuizRunner";

// الاختبار محاولة مخزَّنة على الخادم: إعادة التحميل تستأنف نفس الأسئلة بدل سحب مجموعة أسهل،
// والخروج في منتصفه لا يضيّع ما أُجيب عنه.
export default function QuizScreen({ unitId, onFinish, onBack }) {
  const { data, loading, error, reload } = useAsync(() => startAttempt(unitId), [unitId]);

  if (loading || error || !data?.questions?.length) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <TopBar title="الاختبار" onBack={onBack} />
        <div style={{ padding: "8px 18px" }}>
          {error ? <ErrorState message={error.message} onRetry={reload} onBack={onBack} />
            : loading ? <Skeleton lines={5} />
              : <EmptyState title="لا أسئلة بعد" text="هذه الوحدة لا تملك اختباراً حتى الآن." />}
        </div>
      </div>
    );
  }
  return <QuizRunner unitId={unitId} questions={data.questions} saved={data.answers || []} onFinish={onFinish} onBack={onBack} />;
}
