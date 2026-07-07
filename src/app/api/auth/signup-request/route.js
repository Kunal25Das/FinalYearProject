import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Institute from "@/models/Institute";
import { hashPassword } from "@/lib/auth-utils";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const {
      adminName,
      adminEmail,
      password,
      instituteName,
      instituteAddress,
      instituteWebsite,
    } = await req.json();

    if (
      !adminName ||
      !adminEmail ||
      !password ||
      !instituteName ||
      !instituteAddress
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await dbConnect();

    const normalizedEmail = adminEmail.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 },
      );
    }

    // Check if institute already exists
    const existingInstitute = await Institute.findOne({
      adminEmail: normalizedEmail,
    });
    if (existingInstitute) {
      return NextResponse.json(
        { error: "An institute request for this admin email already exists" },
        { status: 400 },
      );
    }

    // Create Institute request
    const institute = await Institute.create({
      name: instituteName,
      address: instituteAddress,
      website: instituteWebsite,
      adminName,
      adminEmail: normalizedEmail,
      status: "pending",
    });

    // Create User (college-admin, isApproved: false)
    await User.create({
      name: adminName,
      email: normalizedEmail,
      password: hashPassword(password),
      role: "college-admin",
      isApproved: false,
      institute: institute._id,
    });

    // Notify Super Admin via Email
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.ADMIN_EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"UniVerse Platform" <${process.env.ADMIN_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "New Institute Setup Request on UniVerse",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0;">
            <h2 style="color: #6b46c1;">New Institute Setup Request</h2>
            <p>A new registration request has been submitted for approval:</p>
            <ul>
              <li><strong>Institute Name:</strong> ${instituteName}</li>
              <li><strong>Website:</strong> ${instituteWebsite || "N/A"}</li>
              <li><strong>Admin Name:</strong> ${adminName}</li>
              <li><strong>Admin Email:</strong> ${adminEmail}</li>
            </ul>
            <p>Log in to the Super Admin dashboard to approve or reject this request.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error(
        "Failed to send notification email to super-admin:",
        emailErr,
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Institute signup request submitted successfully! Pending approval.",
    });
  } catch (error) {
    console.error("Signup request error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process signup request" },
      { status: 500 },
    );
  }
}
