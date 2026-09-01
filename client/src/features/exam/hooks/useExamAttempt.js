import { useState, useCallback, useRef } from "react";
import { saveAnswer, submitExam } from "../services/exam.service";

const keyOf = (q) => `${q.unitId}:${q.qid}`;

// حالة المحاولة: الإجابات مفتاحها السؤال لا ترتيبه، فالتنقّل حرّ إلى الأمام
// والخلف. وكل تغيير يُرسل إلى الخادم فوراً — الإجابات كانت تعيش في الذاكرة
// حتى التسليم النهائي، فيضيّعها إغلاق اللسان أو نفاد البطارية.
export function useExamAttempt(attempt) {
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries((attempt?.answers || []).map((a) => [`${a.unitId}:${a.qid}`, a.answer])),
  );
  const [syncing, setSyncing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const pending = useRef(0);

  const setAnswer = useCallback(async (q, value) => {
    setAnswers((prev) => ({ ...prev, [keyOf(q)]: value }));
    pending.current += 1;
    setSyncing(true);
    try {
      await saveAnswer(attempt.attemptId, q.unitId, q.qid, value);
      setSaveError("");
    } catch (err) {
      // المهلة المنتهية ليست خطأ حفظ: التسليم سيصحّح ما وصل قبلها
      if (err.code !== "EXAM_EXPIRED") setSaveError("تعذّر حفظ الإجابة، تحقّق من اتصالك");
    } finally {
      pending.current -= 1;
      if (pending.current === 0) setSyncing(false);
    }
  }, [attempt?.attemptId]);

  const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined && v !== "").length;
  const submit = useCallback(() => submitExam(attempt.attemptId), [attempt?.attemptId]);

  return { answers, setAnswer, answeredCount, syncing, saveError, submit, keyOf };
}
