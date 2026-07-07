import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Institute from "@/models/Institute";
import User from "@/models/User";
import nodemailer from "nodemailer";

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

    // Update status to rejected
    institute.status = "rejected";
    await institute.save();

    // Delete or keep user with isApproved: false
    // Let's delete the user to allow re-applying with the same email if needed
    await User.deleteOne({
      email: institute.adminEmail,
      role: "college-admin",
    });

    // Send email notifying the admin of rejection
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
        to: institute.adminEmail,
        subject: "UniVerse Institute Registration Request Update",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0;">
            <h2 style="color: #c53030; text-align: center;">Institute Request Update</h2>
            <p>Hello ${institute.adminName},</p>
            <p>Thank you for your interest in UniVerse. After reviewing your request for <strong>${institute.name}</strong>, we regret to inform you that we are unable to approve your institute setup at this time.</p>
            <p>If you believe this is in error or wish to submit additional information, please reply to this email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="text-align: center; color: #a0aec0; font-size: 12px;">© ${new Date().getFullYear()} UniVerse. All rights reserved.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send rejection email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Institute registration for ${institute.name} has been rejected.`,
    });
  } catch (error) {
    console.error("Reject request error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reject request" },
      { status: 500 },
    );
  }
}
