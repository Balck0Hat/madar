import mongoose from "mongoose";

// علاقة باتجاه واحد محفوظ: from هو من أرسل الطلب، to هو من يقبله
const friendshipSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["pending", "accepted"], default: "pending", index: true },
  },
  { timestamps: true },
);

// زوج فريد؛ الاتجاه المعاكس يُمنع في الخدمة قبل الإنشاء
friendshipSchema.index({ from: 1, to: 1 }, { unique: true });

const Friendship = mongoose.models.Friendship || mongoose.model("Friendship", friendshipSchema);
export default Friendship;
