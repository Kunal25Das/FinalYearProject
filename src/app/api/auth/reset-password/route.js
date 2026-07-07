import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { hashPassword } from "@/lib/auth-utils";

export async function POST(req) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    await dbConnect();
    const normalizedEmail = email.toLowerCase();

    // Verify OTP exists and is valid
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      purpose: "forgot-password",
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP not found or expired. Please request a new one." },
        { status: 400 },
      );
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // Check match
    if (otpRecord.otp !== otp.trim()) {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
    }

    // Find user and update password
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.password = hashPassword(newPassword);
    user.requiresPasswordUpdate = false;
    await user.save();

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      success: true,
      message:
        "Password reset successful! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 500 },
    );
  }
}
