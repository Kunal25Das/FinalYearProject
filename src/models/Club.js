import mongoose from "mongoose";

const ClubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    studentRepresentative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facultyCoordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "disbanded"],
      default: "active",
    },
    category: { type: String, default: "Technology" },
    icon: { type: String, default: "💡" },
    color: { type: String, default: "from-blue-600 to-purple-600" },
    achievements: [{ type: String }],
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Club || mongoose.model("Club", ClubSchema);
