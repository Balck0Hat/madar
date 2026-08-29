import mongoose from "mongoose";

// عنصر مراجعة متباعدة: وحدة لمستخدم مع موعد الاستحقاق والمرحلة
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    unitId: { type: String, required: true },
    stage: { type: Number, default: 0, min: 0 },
    due: { type: Date, required: true },
    lastAnswered: Date,
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);
reviewSchema.index({ user: 1, unitId: 1 }, { unique: true });
reviewSchema.index({ user: 1, due: 1 });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
