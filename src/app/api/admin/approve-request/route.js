import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Institute from "@/models/Institute";
import User from "@/models/User";
import { sendApprovalEmail } from "@/lib/mail";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const institute = await Institute.findById(requestId);
    if (!institute) {
      return NextResponse.json(
        { error: "Institute request not found" },
        { status: 404 },
      );
    }

    if (institute.status !== "pending") {
      return NextResponse.json(
        {
          error: `Request has already been processed: status is ${institute.status}`,
        },
        { status: 400 },
      );
    }

    // Update institute status to approved
    institute.status = "approved";
    await institute.save();

    // Approve the associated user account
    const user = await User.findOne({
      email: institute.adminEmail,
      role: "college-admin",
    });
    if (user) {
      user.isApproved = true;
      await user.save();
    }

    // Send email notification to college-admin
    try {
      await sendApprovalEmail(
        institute.adminEmail,
        institute.adminName,
        institute.name,
      );
    } catch (emailErr) {
      console.error("Failed to send approval notification email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Institute registration for ${institute.name} has been approved!`,
    });
  } catch (error) {
    console.error("Approve request error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve request" },
      { status: 500 },
    );
  }
}
