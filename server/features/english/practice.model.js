import mongoose from "mongoose";

const { Schema } = mongoose;

// محاولة تدريب: وحدة مسار (قراءة/استماع بأقسام)، أو درس إنجليزية عامة، أو تمرين نقطة ضعف
// بوسم، أو مهمة كتابة. تُحفظ كل إجابة بدرجتها، والنتيجة تُحسب عند الإنهاء.
const answerSchema = new Schema({ itemId: String, k: String, type: String, choice: Schema.Types.Mixed, score: Number, correct: Boolean, skipped: Boolean }, { _id: false });
const writingSchema = new Schema(
  {
    text: String, status: { type: String, enum: ["none", "pending", "done", "failed"], default: "none" },
    band: Number, criteria: Schema.Types.Mixed, summary: String, corrections: { type: [{ quote: String, fix: String, note: String }], default: [] }, advice: { type: [String], default: [] },
  },
  { _id: false },
);

const practiceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: { type: String, enum: ["module", "lesson", "weak", "writing"], required: true },
    track: { type: String, enum: ["general", "ielts", "toefl"], required: true },
    refId: { type: String, required: true }, // معرّف الوحدة أو الوسم أو مهمة الكتابة
    itemIds: { type: [String], default: [] }, // أسئلة التمرين المختارة (للدرس ونقطة الضعف)
    doneSections: { type: [String], default: [] },
    answers: { type: [answerSchema], default: [] },
    score: { type: Schema.Types.Mixed, default: null },
    writing: { type: writingSchema, default: () => ({}) },
    startedAt: { type: Date, default: Date.now },
    finishedAt: Date,
  },
  { timestamps: true },
);
practiceSchema.index({ user: 1, kind: 1, refId: 1, createdAt: -1 });

const Practice = mongoose.models.Practice || mongoose.model("Practice", practiceSchema);
export default Practice;
