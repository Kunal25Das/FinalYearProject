import mongoose from "mongoose";

const InstituteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    website: { type: String },
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Institute ||
  mongoose.model("Institute", InstituteSchema);
