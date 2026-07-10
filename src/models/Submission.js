import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["submitted", "graded"],
      default: "submitted",
    },
    marks: { type: Number },
    feedback: { type: String },
    attachmentUrl: { type: String },
  },
  { timestamps: true },
);

export default mongoose.models.Submission ||
  mongoose.model("Submission", SubmissionSchema);
