import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Assignment from "@/models/Assignment";
import Class from "@/models/Class";
import Submission from "@/models/Submission";
import Notice from "@/models/Notice";

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

    // Fetch classes assigned to this faculty
    const classes = await Class.find({
      assignedFaculty: facultyId,
      institute: instituteId,
    });

    const myClasses = [
      { id: "all", name: "All Classes" },
      ...classes.map((c) => ({
        id: c._id.toString(),
        name: `${c.name} (${c.batch})`,
        students: c.students || 0,
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
        const totalStudents = a.classId ? a.classId.students || 0 : 0;

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

    const { title, description, classId, dueDate, dueTime, totalMarks } =
      await req.json();

    if (!title || !classId || !dueDate) {
      return NextResponse.json(
        { error: "Title, Class ID, and Due Date are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const newAssignment = await Assignment.create({
      title,
      description,
      classId,
      faculty: session.user.id,
      dueDate: new Date(dueDate),
      dueTime: dueTime || "23:59",
      totalMarks: totalMarks || 100,
      status: "active",
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

    const {
      id,
      title,
      description,
      classId,
      dueDate,
      dueTime,
      totalMarks,
      status,
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (classId) updateFields.classId = classId;
    if (dueDate) updateFields.dueDate = new Date(dueDate);
    if (dueTime) updateFields.dueTime = dueTime;
    if (totalMarks) updateFields.totalMarks = totalMarks;
    if (status) updateFields.status = status;

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
