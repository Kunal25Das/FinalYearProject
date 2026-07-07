import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Department from "@/models/Department";
import { hashPassword } from "@/lib/auth-utils";
import { sendOneTimePasswordEmail } from "@/lib/mail";
import ActivityLog from "@/models/ActivityLog";
import otpGenerator from "otp-generator";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    // Fetch all users with role 'faculty' under this institute and populate department
    const facultyList = await User.find({
      role: "faculty",
      institute: instituteId,
    })
      .populate("department")
      .sort({ createdAt: -1 });

    const faculty = facultyList.map((f) => {
      const deptId = f.department?._id || f.department;
      return {
        id: f._id.toString(),
        name: f.name,
        email: f.email,
        phone: "+91 98765 43210", // Default placeholder
        department: deptId ? deptId.toString() : "General",
        departmentCode: f.department?.code || "General",
        departmentFull: f.department?.name || "General",
        designation: "Assistant Professor", // Default
        qualification: "Ph.D. / M.Tech",
        experience: "5 years",
        joinedAt: new Date(f.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: f.isApproved ? "active" : "inactive",
      };
    });

    return NextResponse.json({ success: true, faculty });
  } catch (error) {
    console.error("Fetch faculty error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch faculty list" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, department } = await req.json();

    if (!name || !email || !department) {
      return NextResponse.json(
        { error: "Name, email, and department are required fields" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 400 },
      );
    }

    // Generate random one-time password
    const tempPassword = otpGenerator.generate(8, {
      digits: true,
      lowerCaseAlphabet: true,
      upperCaseAlphabet: true,
      specialChars: false,
    });

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashPassword(tempPassword),
      role: "faculty",
      department,
      institute: instituteId,
      requiresPasswordUpdate: true,
      isApproved: true,
    });

    // Send credentials email
    try {
      await sendOneTimePasswordEmail({
        email: normalizedEmail,
        name,
        role: "faculty",
        tempPassword,
      });
    } catch (emailErr) {
      console.error("Failed to send credentials email:", emailErr);
    }

    // Log Activity
    await ActivityLog.create({
      action: "Faculty account created",
      details: `${name} - ${department}`,
      type: "faculty",
      institute: instituteId,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Create faculty error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create faculty account" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Faculty ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const user = await User.findOneAndDelete({
      _id: id,
      institute: instituteId,
      role: "faculty",
    });
    if (!user) {
      return NextResponse.json(
        { error: "Faculty member not found" },
        { status: 404 },
      );
    }

    // Log Activity
    await ActivityLog.create({
      action: "Faculty account terminated",
      details: `${user.name} - ${user.department}`,
      type: "faculty",
      institute: instituteId,
    });

    return NextResponse.json({
      success: true,
      message: "Faculty deleted successfully",
    });
  } catch (error) {
    console.error("Delete faculty error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete faculty account" },
      { status: 500 },
    );
  }
}
