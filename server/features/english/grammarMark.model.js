import mongoose from "mongoose";

// إشارة مرجعية على موضوع في خريطة القواعد (المفضلة)
const grammarMarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topicId: { type: String, required: true },
  },
  { timestamps: true },
);
grammarMarkSchema.index({ user: 1, topicId: 1 }, { unique: true });

const GrammarMark = mongoose.models.GrammarMark || mongoose.model("GrammarMark", grammarMarkSchema);
export default GrammarMark;
