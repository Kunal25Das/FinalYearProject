import mongoose from "mongoose";

const BatchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "CSE Batch 2024"
    year: { type: String, required: true }, // e.g. "2024"
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    }, // References Department model
    sections: [{ type: String }], // e.g. ["A", "B"]
    classAdvisor: { type: String }, // e.g. "Dr. Sharma"
    status: {
      type: String,
      enum: ["active", "archived", "passout"],
      default: "active",
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Batch || mongoose.model("Batch", BatchSchema);
