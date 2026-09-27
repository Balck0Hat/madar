import mongoose from "mongoose";

// إشارة مرجعية على موضوع في قسم التقنية (المفضلة)
const techMarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topicId: { type: String, required: true },
  },
  { timestamps: true },
);
techMarkSchema.index({ user: 1, topicId: 1 }, { unique: true });

const TechMark = mongoose.models.TechMark || mongoose.model("TechMark", techMarkSchema);
export default TechMark;
