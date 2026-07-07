import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth-utils";
import { sendOneTimePasswordEmail } from "@/lib/mail";
import otpGenerator from "otp-generator";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, role, department } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 },
      );
    }

    const allowedRoles = [
      "dept-admin",
      "faculty",
      "student",
      "club-admin",
      "event-organizer",
    ];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified for provisioning" },
        { status: 400 },
      );
    }

    await dbConnect();
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 400 },
      );
    }

    // Generate random 8-character one-time password
    const tempPassword = otpGenerator.generate(8, {
      digits: true,
      lowerCaseAlphabet: true,
      upperCaseAlphabet: true,
      specialChars: false,
    });

    // Create the user linked to college-admin's institute
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashPassword(tempPassword),
      role,
      department: department || "",
      institute: session.user.instituteId,
      requiresPasswordUpdate: true,
      isApproved: true,
    });

    // Send email with credentials
    try {
      await sendOneTimePasswordEmail({
        email: normalizedEmail,
        name,
        role,
        tempPassword,
      });
    } catch (emailErr) {
      console.error("Failed to send credentials email to new user:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: `User ${name} has been added successfully. Credentials sent to ${normalizedEmail}.`,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 },
    );
  }
}
