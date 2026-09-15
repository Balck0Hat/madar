import mongoose from "mongoose";

const { Schema } = mongoose;

// تقدّم القارئ في الشخصيات: متى أنهى كل قصة، وآخر قسم وصل إليه فيها.
// وثيقة واحدة لكل مستخدم، فالمجموعة بحجم عدد القرّاء لا عدد القراءات.
const figureProgressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    read: { type: Map, of: Date, default: () => new Map() },
    page: { type: Map, of: Number, default: () => new Map() },
  },
  { timestamps: true },
);

const FigureProgress = mongoose.models.FigureProgress || mongoose.model("FigureProgress", figureProgressSchema);
export default FigureProgress;
