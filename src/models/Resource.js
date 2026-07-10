import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["notes", "slides", "code", "assignment", "video", "other"],
      default: "notes",
    },
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
    fileName: { type: String },
    fileSize: { type: String, default: "0 KB" },
    fileUrl: { type: String },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Resource ||
  mongoose.model("Resource", ResourceSchema);
