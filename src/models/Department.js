import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Computer Science & Engineering"
    code: { type: String, required: true }, // e.g. "CSE"
    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    defaultMaxLoad: { type: Number, default: 16 },
  },
  { timestamps: true },
);

export default mongoose.models.Department ||
  mongoose.model("Department", DepartmentSchema);
