import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { env } from "../config/env.js";
import { heuristicOpen } from "./grading.js";

const GradeSchema = z.object({
  correct: z.boolean(),
  feedback: z.string(),
});

const SYSTEM = `أنت مصحّح في منصة تعليمية عربية للثقافة العامة. تُقيّم إجابة متعلّم على سؤال مفتوح قصير.
اقبل الإجابة إذا حملت الفكرة الأساسية ولو بصياغة بسيطة أو أخطاء إملائية. ارفضها إذا كانت فارغة المعنى أو خاطئة أو خارج الموضوع.
اكتب تغذية راجعة من جملة واحدة بالعربية، ودودة ومحددة.`;

let client = null;
const getClient = () => {
  if (!env.anthropicKey) return null;
  if (!client) client = new Anthropic({ apiKey: env.anthropicKey, maxRetries: 1, timeout: 20_000 });
  return client;
};

export const aiEnabled = () => Boolean(env.anthropicKey);

// يصحّح سؤالاً مفتوحاً: بالنموذج إن توفر المفتاح، وإلا بتقدير تقريبي
export async function gradeOpen(q, answer) {
  const c = getClient();
  if (!c) return { ...heuristicOpen(q, answer), source: "heuristic" };
  try {
    const res = await c.messages.parse({
      model: env.aiModel,
      max_tokens: 512,
      system: SYSTEM,
      messages: [{ role: "user", content: `السؤال: ${q.q}\nمعيار القبول: ${q.why || "الفكرة الأساسية للدرس"}\nإجابة المتعلم: ${answer}` }],
      output_config: { format: zodOutputFormat(GradeSchema), effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) return { ...heuristicOpen(q, answer), source: "heuristic" };
    return { ok: res.parsed_output.correct, feedback: res.parsed_output.feedback, source: "ai" };
  } catch (err) {
    console.error("[ai] grading failed, falling back to heuristic:", err.message);
    return { ...heuristicOpen(q, answer), source: "heuristic" };
  }
}
