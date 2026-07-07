import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { sendOtpEmail } from "@/lib/mail";
import otpGenerator from "otp-generator";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address" },
        { status: 404 },
      );
    }

    // Generate 6-digit numeric OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabet: false,
      upperCaseAlphabet: false,
      specialChars: false,
    });

    // Valid for 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save/overwrite OTP in database
    await OTP.findOneAndUpdate(
      { email: normalizedEmail, purpose: "forgot-password" },
      { otp, expiresAt },
      { upsert: true, new: true },
    );

    // Send email via nodemailer
    await sendOtpEmail(normalizedEmail, otp);

    return NextResponse.json({
      success: true,
      message: "Password reset OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process forgot password request" },
      { status: 500 },
    );
  }
}
