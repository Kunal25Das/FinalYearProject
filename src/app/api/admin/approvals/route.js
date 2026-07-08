import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import ApprovalRequest from "@/models/ApprovalRequest";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";
import { hashPassword } from "@/lib/auth-utils";
import { sendOneTimePasswordEmail } from "@/lib/mail";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const requests = await ApprovalRequest.find({
      institute: instituteId,
    }).sort({ createdAt: -1 });

    const formattedRequests = requests.map((req) => ({
      id: req._id.toString(),
      type: req.type,
      typeName: req.typeName,
      name: req.name,
      description: req.description,
      requestedBy: req.requestedBy,
      email: req.email,
      phone: req.phone || "N/A",
      department: req.department || "General",
      batch: req.batch || "N/A",
      requestDate: new Date(req.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: req.status,
      rejectReason: req.rejectReason || "",
      documents: req.documents || [],
      additionalInfo: req.additionalInfo || "",
    }));

    return NextResponse.json({ success: true, requests: formattedRequests });
  } catch (error) {
    console.error("Fetch approvals error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load approvals" },
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

    const { requestId, action, rejectReason } = await req.json();

    if (!requestId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Request ID and valid action (approve/reject) are required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const approvalRequest = await ApprovalRequest.findOne({
      _id: requestId,
      institute: instituteId,
    });
    if (!approvalRequest) {
      return NextResponse.json(
        { error: "Approval request not found" },
        { status: 404 },
      );
    }

    if (approvalRequest.status !== "pending") {
      return NextResponse.json(
        {
          error: `Request already processed: status is ${approvalRequest.status}`,
        },
        { status: 400 },
      );
    }

    if (action === "approve") {
      approvalRequest.status = "approved";
      await approvalRequest.save();

      // Find user and update their role
      let user = await User.findOne({
        email: approvalRequest.email.toLowerCase(),
      });
      let tempPassword = "";

      if (user) {
        // Add to special roles of existing user
        if (!user.specialRoles) {
          user.specialRoles = [];
        }
        if (!user.specialRoles.includes(approvalRequest.type)) {
          user.specialRoles.push(approvalRequest.type);
        }
        await user.save();
      } else {
        // Provision a new user account with student primary role
        tempPassword = otpGenerator.generate(8, {
          digits: true,
          lowerCaseAlphabet: true,
          upperCaseAlphabet: true,
          specialChars: false,
        });

        user = await User.create({
          name: approvalRequest.requestedBy,
          email: approvalRequest.email.toLowerCase(),
          password: hashPassword(tempPassword),
          role: "student",
          specialRoles: [approvalRequest.type],
          department: approvalRequest.department || "",
          institute: instituteId,
          requiresPasswordUpdate: true,
          isApproved: true,
        });

        // Email temporary credentials
        try {
          await sendOneTimePasswordEmail({
            email: approvalRequest.email.toLowerCase(),
            name: approvalRequest.requestedBy,
            role: approvalRequest.typeName,
            tempPassword,
          });
        } catch (emailErr) {
          console.error("Failed to send credentials email:", emailErr);
        }
      }

      // Send approval confirmation email
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
          to: approvalRequest.email,
          subject: `Request for ${approvalRequest.typeName} Approved!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0;">
              <h2 style="color: #2f855a;">Request Approved 🎉</h2>
              <p>Hello ${approvalRequest.requestedBy},</p>
              <p>Your request to be registered as <strong>${approvalRequest.typeName}</strong> for <strong>${approvalRequest.name}</strong> has been approved by the College Admin!</p>
              <p>You can now log in using your registered credentials to access your club/event manager dashboard.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send approval email:", emailErr);
      }

      // Log Activity
      await ActivityLog.create({
        action: `${approvalRequest.typeName} approved`,
        details: approvalRequest.name,
        type: "approval",
        institute: instituteId,
      });
    } else {
      // Rejection flow
      approvalRequest.status = "rejected";
      approvalRequest.rejectReason =
        rejectReason ||
        "Request details did not satisfy verification requirements.";
      await approvalRequest.save();

      // Send rejection email
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
          to: approvalRequest.email,
          subject: `Request for ${approvalRequest.typeName} Update`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0;">
              <h2 style="color: #c53030;">Request Rejected</h2>
              <p>Hello ${approvalRequest.requestedBy},</p>
              <p>Thank you for submitting your request for <strong>${approvalRequest.name}</strong>.</p>
              <p>Unfortunately, your request has been rejected by the College Admin due to the following reason:</p>
              <blockquote style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 10px; margin: 15px 0;">
                ${approvalRequest.rejectReason}
              </blockquote>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send rejection email:", emailErr);
      }

      // Log Activity
      await ActivityLog.create({
        action: `${approvalRequest.typeName} rejected`,
        details: approvalRequest.name,
        type: "approval",
        institute: instituteId,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Request for ${approvalRequest.name} has been ${action}d successfully.`,
    });
  } catch (error) {
    console.error("Process approval error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 },
    );
  }
}
