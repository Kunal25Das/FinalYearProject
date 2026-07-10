import mongoose from "mongoose";

const ScheduleOverrideSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actionType: {
      type: String,
      enum: ["cancel", "reschedule"],
      required: true,
    },
    date: { type: Date, required: true }, // Date of the original slot
    originalTime: { type: String }, // e.g. "09:00 AM - 10:00 AM"
    newDate: { type: Date }, // only if actionType is "reschedule"
    newTime: { type: String }, // e.g. "11:00 AM - 12:00 PM"
    reason: { type: String },
    notifiedCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.ScheduleOverride ||
  mongoose.model("ScheduleOverride", ScheduleOverrideSchema);
