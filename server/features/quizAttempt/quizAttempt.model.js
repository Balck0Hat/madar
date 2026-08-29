import mongoose from "mongoose";

// عمر المحاولة المفتوحة: يوم واحد. بعده تُحذف تلقائياً وتُسحب أسئلة جديدة
export const ATTEMPT_TTL_SECONDS = 24 * 60 * 60;

const answerSchema = new mongoose.Schema(
  {
    qid: { type: String, required: true },
    answer: { type: mongoose.Schema.Types.Mixed },
    // تقييم ذاتي للسؤال المفتوح: فهمتها / لم أفهمها
    selfMark: { type: String, enum: ["got", "unclear"] },
  },
  { _id: false },
);

// محاولة اختبار مفتوحة: الأسئلة تُسحب مرة واحدة وتُخزَّن، فلا يُعاد السحب عند إعادة التحميل
const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    unitId: { type: String, required: true, trim: true },
    questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    answers: { type: [answerSchema], default: [] },
    startedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// محاولة واحدة مفتوحة لكل وحدة لكل متعلم: هذا ما يمنع إعادة سحب أسئلة أسهل
quizAttemptSchema.index({ user: 1, unitId: 1 }, { unique: true });
// انتهاء صلاحية تلقائي بعد 24 ساعة حتى لا تبقى محاولة مهجورة تحبس الأسئلة
quizAttemptSchema.index({ startedAt: 1 }, { expireAfterSeconds: ATTEMPT_TTL_SECONDS });

const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema);
export default QuizAttempt;
