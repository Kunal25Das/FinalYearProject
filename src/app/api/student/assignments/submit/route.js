import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Submission from "@/models/Submission";
import User from "@/models/User";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const assignmentId = formData.get("assignmentId");
    const feedback = formData.get("feedback") || "";
    const file = formData.get("file");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Find student
    let student = await User.findById(session.user.id);
    if (!student && session.user.email) {
      student = await User.findOne({ email: session.user.email });
    }

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 },
      );
    }

    let fileUrl = "";
    if (file) {
      // Upload to Appwrite Storage server-side!
      const endpoint =
        process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
        "https://fra.cloud.appwrite.io/v1";
      const bucketId = (
        process.env.APPWRITE_BUCKET_ID || "6a4cb689003165e24143"
      ).replace(/^"|"$/g, "");
      const projectId = (
        process.env.APPWRITE_PROJECT_ID || "6a4cb5500038fd245209"
      ).replace(/^"|"$/g, "");
      const apiKey = (process.env.APPWRITE_API_KEY || "").replace(/^"|"$/g, "");

      const appwriteFormData = new FormData();
      appwriteFormData.append("fileId", "unique()");
      appwriteFormData.append("file", file);

      const appwriteRes = await fetch(
        `${endpoint}/storage/buckets/${bucketId}/files`,
        {
          method: "POST",
          headers: {
            "X-Appwrite-Project": projectId,
            "X-Appwrite-Key": apiKey,
          },
          body: appwriteFormData,
        },
      );

      if (!appwriteRes.ok) {
        const errText = await appwriteRes.text();
        console.error("Appwrite student submission upload error:", errText);
        throw new Error(
          "Failed to upload submission to Appwrite storage bucket",
        );
      }

      const responseData = await appwriteRes.json();
      const fileId = responseData.$id;
      fileUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
    }

    // Upsert submission
    const submission = await Submission.findOneAndUpdate(
      { assignmentId, student: student._id },
      {
        status: "submitted",
        submittedAt: new Date(),
        attachmentUrl: fileUrl || undefined,
        feedback: feedback,
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Student assignment submit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit assignment" },
      { status: 500 },
    );
  }
}
