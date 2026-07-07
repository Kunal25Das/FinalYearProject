import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g. "New batch created"
    details: { type: String, required: true }, // e.g. "CSE Batch 2025"
    type: {
      type: String,
      enum: ["batch", "faculty", "approval", "notice", "import"],
      required: true,
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);
