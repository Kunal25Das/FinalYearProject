import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema(
  {
    code: { type: String, required: true }, // e.g. "CS101"
    name: { type: String, required: true }, // e.g. "Introduction to Programming"
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
    batch: { type: String, required: true }, // e.g. "2024" (corresponds to Batch.year)
    credits: { type: Number, required: true, default: 3 },
    type: { type: String, enum: ["theory", "lab"], default: "theory" },
    hoursPerWeek: { type: Number, required: true, default: 3 },
    assignedFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    studentsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Class || mongoose.model("Class", ClassSchema);
