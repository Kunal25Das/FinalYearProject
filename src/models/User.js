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
      ],
      required: true,
    },
    specialRoles: [
      {
        type: String,
        enum: ["club-admin", "event-organizer", "club-advisor"],
      },
    ],
    institute: { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" }, // References Department model
    phone: { type: String }, // e.g. +91 9876543210
    rollNo: { type: String }, // e.g. CSE2024001
    batch: { type: String }, // e.g. 2024
    isApproved: { type: Boolean, default: true }, // For college-admin, must be approved by super-admin
    requiresPasswordUpdate: { type: Boolean, default: false }, // Force change password on first login
    isDisabled: { type: Boolean, default: false },
    designation: { type: String },
    qualification: { type: String },
    experience: { type: String },
    specialization: [{ type: String }],
    publications: { type: Number, default: 0 },
    maxLoad: { type: Number, default: 16 },
    coins: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
