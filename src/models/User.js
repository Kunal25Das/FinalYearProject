import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional for Google OAuth users, required for credentials
    role: {
      type: String,
      enum: [
        "super-admin",
        "college-admin",
        "dept-admin",
        "faculty",
        "student",
        "club-admin",
        "event-organizer",
      ],
      required: true,
    },
    institute: { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
    department: { type: String }, // e.g. CSE, ECE, ME
    isApproved: { type: Boolean, default: true }, // For college-admin, must be approved by super-admin
    requiresPasswordUpdate: { type: Boolean, default: false }, // Force change password on first login
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
