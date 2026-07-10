import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Submission from "@/models/Submission";
import User from "@/models/User";

// GET: Fetch all student submissions for a specific assignment
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Query submissions
    const submissionsDocs = await Submission.find({ assignmentId })
      .populate("student")
      .sort({ createdAt: 1 });

    const submissions = submissionsDocs.map((s) => ({
      id: s._id.toString(),
      studentName: s.student ? s.student.name : "Unknown Student",
      studentId: s.student
        ? s.student.enrollmentNo || s.student.email
        : "CS-TBD",
      submittedAt: new Date(s.submittedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: s.status,
      marks: s.marks !== undefined ? s.marks : null,
      feedback: s.feedback || null,
      attachmentUrl: s.attachmentUrl || null,
    }));

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error("Fetch submissions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}

// PUT: Grade a submission (update marks and feedback)
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId, marks, feedback } = await req.json();

    if (!submissionId || marks === undefined) {
      return NextResponse.json(
        { error: "Submission ID and Marks are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const graded = await Submission.findByIdAndUpdate(
      submissionId,
      {
        $set: {
          marks: parseInt(marks),
          feedback: feedback || "",
          status: "graded",
        },
      },
      { new: true },
    );

    if (!graded) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, submission: graded });
  } catch (error) {
    console.error("Grade submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to grade submission" },
      { status: 500 },
    );
  }
}
