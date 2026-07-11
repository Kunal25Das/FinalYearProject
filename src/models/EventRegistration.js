import mongoose from "mongoose";

const EventRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClubEvent",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    registeredAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "confirmed", "attended", "cancelled"],
      default: "confirmed",
    },
    teamName: { type: String, default: null },
    teamSize: { type: Number, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.EventRegistration ||
  mongoose.model("EventRegistration", EventRegistrationSchema);
