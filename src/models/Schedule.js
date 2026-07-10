import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    batch: { type: String, required: true }, // e.g. "2024"
    semester: { type: String, enum: ["odd", "even"], required: true },
    fileName: { type: String, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "replaced", "inactive"],
      default: "active",
    },
    scheduleData: [
      {
        day: { type: String, required: true }, // e.g. "Monday"
        time: { type: String, required: true }, // e.g. "09:00 - 10:00"
        subject: { type: String, required: true }, // Subject code e.g. "CS101"
        faculty: { type: String }, // e.g. "Dr. Smith"
        room: { type: String }, // e.g. "A101"
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.Schedule ||
  mongoose.model("Schedule", ScheduleSchema);
