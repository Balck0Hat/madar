import { useCallback, useEffect, useRef, useState } from "react";
import { useAsync } from "../../../shared/hooks/useAsync";
import { getChallenge, answerChallenge } from "../services/challenge.service";

// نقاط الإجابة الصحيحة من أول محاولة في اليوم
export const CHALLENGE_XP = 20;

// حالة تحدي اليوم لأي شاشة: الخريطة تستعملها لشارة صغيرة، والبطاقة للتفاعل الكامل
export function useChallenge() {
  const { data, loading, error, reload } = useAsync(getChallenge, []);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // مرجع لا يتأخر مثل الحالة: يمنع الإرسال المزدوج بين نقرتين سريعتين
  const inFlight = useRef(false);

  // أي جلب جديد يلغي نتيجة الجلسة السابقة حتى لا تختلط بيانات يومين
  useEffect(() => { setResult(null); setSubmitError(null); }, [data]);

  const answered = !!result || !!data?.answeredToday;

  const submit = useCallback(async (answer) => {
    if (inFlight.current || answered || !data?.question) return null;
    inFlight.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = (await answerChallenge(answer)) || {};
      setResult(res);
      return res;
    } catch (err) {
      setSubmitError(err);
      return null;
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }, [answered, data]);

  const stats = result?.stats || {};
  return {
    question: data?.question || null,
    answered,
    // صحيح اليوم: نتيجة هذه الجلسة أولاً، ثم ما جاء من الخادم
    correct: result ? !!result.correct : !!data?.correctToday,
    // النتيجة الطازجة فقط، لتُعرض التغذية الراجعة مرة واحدة بعد الإجابة
    result,
    streak: stats.streak ?? data?.streak ?? 0,
    totalAnswered: stats.totalAnswered ?? data?.totalAnswered ?? 0,
    pending: !loading && !error && !!data?.question && !answered,
    loading, error, reload, submit, submitting, submitError,
  };
}
