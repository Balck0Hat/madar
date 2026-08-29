import mongoose from "mongoose";

// إحصاء لكل سؤال: كم مرة عُرض وكم مرة أُخطئ (لتحسين المحتوى)
const questionStatSchema = new mongoose.Schema(
  {
    unitId: { type: String, required: true },
    qid: { type: String, required: true },
    asked: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
  },
  { timestamps: true },
);
questionStatSchema.index({ unitId: 1, qid: 1 }, { unique: true });

const QuestionStat = mongoose.models.QuestionStat || mongoose.model("QuestionStat", questionStatSchema);
export default QuestionStat;
