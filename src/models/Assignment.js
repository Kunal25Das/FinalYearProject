import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
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
    dueDate: { type: Date, required: true },
    dueTime: { type: String, default: "23:59" },
    totalMarks: { type: Number, default: 100 },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.Assignment ||
  mongoose.model("Assignment", AssignmentSchema);
