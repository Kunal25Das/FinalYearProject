import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: {
      type: String,
      enum: ["Normal", "Important", "Urgent"],
      default: "Normal",
    },
    audience: {
      type: String,
      enum: ["All", "Students", "Faculty", "Staff", "Department"],
      default: "All",
    },
    department: { type: String }, // optional, for department-specific notices
    batch: { type: String }, // optional, for batch-specific notices
    pinned: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    author: { type: String, default: "Administration" },
    status: { type: String, enum: ["active", "archived"], default: "active" },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
