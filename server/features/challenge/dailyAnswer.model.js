import mongoose from "mongoose";

// إجابة واحدة لكل مستخدم في اليوم: الفهرس الفريد هو ما يجعل POST متكرراً بلا أثر
const dailyAnswerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    day: { type: String, required: true },
    qid: { type: String, required: true },
    correct: { type: Boolean, required: true },
  },
  { timestamps: true },
);

dailyAnswerSchema.index({ user: 1, day: 1 }, { unique: true });

const DailyAnswer = mongoose.models.DailyAnswer || mongoose.model("DailyAnswer", dailyAnswerSchema);
export default DailyAnswer;
