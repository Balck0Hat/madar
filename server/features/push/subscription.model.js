import mongoose from "mongoose";

// اشتراك Web Push لجهاز واحد
const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: { p256dh: { type: String, required: true }, auth: { type: String, required: true } },
    userAgent: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true },
);

const PushSubscription = mongoose.models.PushSubscription || mongoose.model("PushSubscription", subscriptionSchema);
export default PushSubscription;
