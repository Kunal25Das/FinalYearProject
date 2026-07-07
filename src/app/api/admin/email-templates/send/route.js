import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { sendCustomEmail } from "@/lib/mail";
import ActivityLog from "@/models/ActivityLog";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetType, departmentId, batchId, recipientEmail, subject, body } =
      await req.json();

    if (!subject || !body || !targetType) {
      return NextResponse.json(
        { error: "Subject, body, and target type are required fields" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    // Handle specific single email address dispatch
    if (targetType === "specific-email") {
      if (!recipientEmail) {
        return NextResponse.json(
          { error: "Recipient email address is required" },
          { status: 400 },
        );
      }

      await sendCustomEmail({
        to: recipientEmail,
        subject,
        body: body.replace(/     /g, " "),
      });

      // Log Activity
      await ActivityLog.create({
        action: "Individual email sent",
        details: `${subject} (Recipient: ${recipientEmail})`,
        type: "notices",
        institute: instituteId,
      });

      return NextResponse.json({ success: true, count: 1 });
    }

    // Filter recipients
    const query = { institute: instituteId, isApproved: true };

    if (targetType === "all-students") {
      query.role = "student";
    } else if (targetType === "all-faculty") {
      query.role = "faculty";
    } else if (targetType === "dept-students") {
      query.role = "student";
      query.department = departmentId;
    } else if (targetType === "batch-students") {
      query.role = "student";
      query.department = departmentId;
      query.batch = batchId;
    } else {
      return NextResponse.json(
        { error: "Invalid target recipient type" },
        { status: 400 },
      );
    }

    const users = await User.find(query).select("email name");

    if (users.length === 0) {
      return NextResponse.json(
        { error: "No matching recipients found for the selected criteria" },
        { status: 404 },
      );
    }

    // Send emails in parallel batches
    const emailPromises = users.map((user) => {
      // Replace name inside body if personalized tags still exist
      let personalizedBody = body.replace(/     /g, " "); // Clean spacing placeholders
      personalizedBody = personalizedBody.replace(/<Student Name>/g, user.name);
      personalizedBody = personalizedBody.replace(/<Faculty Name>/g, user.name);

      return sendCustomEmail({
        to: user.email,
        subject,
        body: personalizedBody,
      });
    });

    await Promise.all(emailPromises);

    // Log Activity
    await ActivityLog.create({
      action: "Broadcast email sent",
      details: `${subject} (Recipients: ${users.length} members)`,
      type: "notices",
      institute: instituteId,
    });

    return NextResponse.json({ success: true, count: users.length });
  } catch (error) {
    console.error("Broadcast email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to broadcast email" },
      { status: 500 },
    );
  }
}
