import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["forgot-password", "verify-email"],
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// TTL index to delete document when expiresAt time is reached
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);
