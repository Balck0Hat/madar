import mongoose from "mongoose";

// شهادة الثقافة العامة: تُمنح باجتياز امتحان المدار الأول
const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);
export default Certificate;
