import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Assignment from "@/models/Assignment";
import Class from "@/models/Class";
import Submission from "@/models/Submission";
import Notice from "@/models/Notice";
import User from "@/models/User";

// GET: Fetch faculty assignments and class dropdown list
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const facultyId = session.user.id;
    const instituteId = session.user.instituteId;
    const deptId = session.user.department;

    // Fetch classes assigned to this faculty
    const classes = await Class.find({
      assignedFaculty: facultyId,
      institute: instituteId,
    });

    // Query dynamic student counts per batch to prevent displaying 0 students
    const uniqueBatches = [...new Set(classes.map((c) => c.batch))];
    const studentCountMap = {};
    await Promise.all(
      uniqueBatches.map(async (batchStr) => {
        const count = await User.countDocuments({
          role: "student",
          department: deptId,
          institute: instituteId,
          batch: batchStr,
        });
        studentCountMap[batchStr] = count;
      }),
    );

    const myClasses = [
      { id: "all", name: "All Classes" },
      ...classes.map((c) => ({
        id: c._id.toString(),
        name: `${c.name} (${c.batch})`,
        students: studentCountMap[c.batch] || 0,
      })),
    ];

    // Fetch assignments posted by this faculty
    const assignmentsDocs = await Assignment.find({
      faculty: facultyId,
    })
      .populate("classId")
      .sort({ createdAt: -1 });

    const assignments = await Promise.all(
      assignmentsDocs.map(async (a) => {
        const totalStudents = a.classId
          ? studentCountMap[a.classId.batch] || 0
          : 0;

        // Query submission stats
        const submitted = await Submission.countDocuments({
          assignmentId: a._id,
        });
        const graded = await Submission.countDocuments({
          assignmentId: a._id,
          status: "graded",
        });

        return {
          id: a._id.toString(),
          title: a.title,
          description: a.description || "",
          classId: a.classId ? a.classId._id.toString() : "",
          className: a.classId ? a.classId.name : "Deleted Class",
          batch: a.classId ? `Batch ${a.classId.batch}` : "",
          dueDate: new Date(a.dueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          rawDueDate: a.dueDate.toISOString().split("T")[0],
          dueTime: a.dueTime || "23:59",
          totalMarks: a.totalMarks || 100,
          totalStudents,
          submitted,
          graded,
          status: a.status,
          createdAt: new Date(a.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        };
      }),
    );

    return NextResponse.json({ success: true, assignments, myClasses });
  } catch (error) {
    console.error("Fetch assignments error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch assignments" },
      { status: 500 },
    );
  }
}

// POST: Create a new assignment
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description") || "";
    const classId = formData.get("classId");
    const dueDate = formData.get("dueDate");
    const dueTime = formData.get("dueTime") || "23:59";
    const totalMarks = parseInt(formData.get("totalMarks")) || 100;
    const file = formData.get("file");

    if (!title || !classId || !dueDate) {
      return NextResponse.json(
        { error: "Title, Class ID, and Due Date are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    let attachmentsList = [];
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
        console.error("Appwrite upload error:", errText);
        throw new Error("Failed to upload file to Appwrite storage bucket");
      }

      const responseData = await appwriteRes.json();
      const fileId = responseData.$id;
      const fileUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
      attachmentsList = [
        {
          name: file.name,
          url: fileUrl,
        },
      ];
    }

    const newAssignment = await Assignment.create({
      title,
      description,
      classId,
      faculty: session.user.id,
      dueDate: new Date(dueDate),
      dueTime,
      totalMarks,
      status: "active",
      attachments: attachmentsList,
    });

    // Also share a dynamic Class Notice about this new assignment!
    const targetClass = await Class.findById(classId);
    if (targetClass) {
      await Notice.create({
        title: `New Assignment: ${title}`,
        content: `A new assignment has been posted for ${targetClass.name}. Due Date: ${new Date(dueDate).toLocaleDateString()} at ${dueTime || "23:59"}. Marks: ${totalMarks || 100}. Description: ${description || "No description provided."}`,
        audience: "Class",
        classId,
        priority: "Normal",
        author: session.user.id,
        institute: session.user.instituteId,
      });
    }

    return NextResponse.json({ success: true, assignment: newAssignment });
  } catch (error) {
    console.error("Create assignment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create assignment" },
      { status: 500 },
    );
  }
}

// PUT: Modify an assignment
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get("id");
    const title = formData.get("title");
    const description = formData.get("description");
    const classId = formData.get("classId");
    const dueDate = formData.get("dueDate");
    const dueTime = formData.get("dueTime");
    const totalMarks = formData.get("totalMarks");
    const status = formData.get("status");
    const file = formData.get("file");
    const existingAttachments = formData.get("existingAttachments");

    if (!id) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description !== null && description !== undefined)
      updateFields.description = description;
    if (classId) updateFields.classId = classId;
    if (dueDate) updateFields.dueDate = new Date(dueDate);
    if (dueTime) updateFields.dueTime = dueTime;
    if (totalMarks) updateFields.totalMarks = parseInt(totalMarks) || 100;
    if (status) updateFields.status = status;

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
        console.error("Appwrite upload error:", errText);
        throw new Error("Failed to upload file to Appwrite storage bucket");
      }

      const responseData = await appwriteRes.json();
      const fileId = responseData.$id;
      const fileUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
      updateFields.attachments = [
        {
          name: file.name,
          url: fileUrl,
        },
      ];
    } else if (
      existingAttachments !== null &&
      existingAttachments !== undefined
    ) {
      try {
        updateFields.attachments = JSON.parse(existingAttachments);
      } catch (err) {
        console.error("Failed to parse existing attachments:", err);
      }
    }

    const updated = await Assignment.findOneAndUpdate(
      { _id: id, faculty: session.user.id },
      { $set: updateFields },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Assignment not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, assignment: updated });
  } catch (error) {
    console.error("Modify assignment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to modify assignment" },
      { status: 500 },
    );
  }
}

// DELETE: Delete an assignment
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("id");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const deleted = await Assignment.findOneAndDelete({
      _id: assignmentId,
      faculty: session.user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Assignment not found or unauthorized" },
        { status: 404 },
      );
    }

    // Also delete submissions associated with this assignment
    await Submission.deleteMany({ assignmentId });

    return NextResponse.json({ success: true, message: "Assignment deleted" });
  } catch (error) {
    console.error("Delete assignment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete assignment" },
      { status: 500 },
    );
  }
}
