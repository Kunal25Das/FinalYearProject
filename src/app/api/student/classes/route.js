import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Class from "@/models/Class";
import Notice from "@/models/Notice";
import Resource from "@/models/Resource";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import User from "@/models/User";

export async function GET(_req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find student context
    let student = await User.findById(session.user.id);
    if (!student && session.user.email) {
      student = await User.findOne({ email: session.user.email });
    }

    if (!student || !student.batch || !student.department) {
      return NextResponse.json(
        { error: "Student profile or batch context missing" },
        { status: 400 },
      );
    }

    // 1. Fetch classes matching student's department, institute, and batch
    const classes = await Class.find({
      batch: student.batch,
      department: student.department,
      institute: student.institute,
    }).populate("assignedFaculty", "name");

    const classIds = classes.map((c) => c._id);

    // 2. Fetch notices targeting this class list, batch, department, or generic student audience
    const classNotices = await Notice.find({
      $or: [
        { classId: { $in: classIds } },
        { audience: "All" },
        { audience: "Students" },
        { audience: "Department", department: student.department.toString() },
        { batch: student.batch },
      ],
      status: "active",
    }).sort({ publishedAt: -1 });

    // 3. Fetch resources shared with these classes
    const resources = await Resource.find({ classId: { $in: classIds } });

    // 4. Fetch assignments for these classes
    const assignments = await Assignment.find({ classId: { $in: classIds } });
    const assignmentIds = assignments.map((a) => a._id);

    // 5. Fetch submission records of this student
    const submissions = await Submission.find({
      assignmentId: { $in: assignmentIds },
      student: student._id,
    });

    const submissionsMap = {};
    submissions.forEach((s) => {
      submissionsMap[s.assignmentId.toString()] = s;
    });

    // 6. Map and build classes data structure
    const formattedClasses = classes.map((cls) => {
      const clsIdStr = cls._id.toString();

      // Class Notices
      const noticesForClass = classNotices
        .filter(
          (n) =>
            (n.classId && n.classId.toString() === clsIdStr) ||
            (!n.classId && n.audience === "Class" && n.classId === clsIdStr) ||
            n.audience === "All" ||
            n.audience === "Students" ||
            (n.audience === "Department" &&
              n.department === student.department.toString()) ||
            n.batch === student.batch,
        )
        .map((n) => ({
          id: n._id.toString(),
          title: n.title,
          date: new Date(n.publishedAt || n.createdAt)
            .toISOString()
            .split("T")[0],
          content: n.content,
          priority: n.priority,
        }));

      // Class Resources
      const resourcesForClass = resources
        .filter((r) => r.classId.toString() === clsIdStr)
        .map((r) => ({
          id: r._id.toString(),
          name: r.fileName || r.title,
          size: r.fileSize || "1.2 MB",
          uploadDate: new Date(r.createdAt).toISOString().split("T")[0],
          fileUrl: r.fileUrl,
        }));

      // Class Assignments
      const assignmentsForClass = assignments
        .filter((a) => a.classId.toString() === clsIdStr)
        .map((a) => {
          const sub = submissionsMap[a._id.toString()];
          return {
            id: a._id.toString(),
            title: a.title,
            description: a.description || "",
            dueDate: new Date(a.dueDate).toISOString().split("T")[0],
            dueTime: a.dueTime || "23:59",
            totalMarks: a.totalMarks || 100,
            status: sub
              ? sub.status === "graded"
                ? "graded"
                : "submitted"
              : "pending",
            submittedAt: sub
              ? new Date(sub.submittedAt).toLocaleDateString()
              : null,
            marks: sub && sub.marks !== undefined ? sub.marks : null,
            feedback: sub ? sub.feedback : null,
            attachmentUrl: sub ? sub.attachmentUrl : null,
          };
        });

      // Palette selection matching class code hash
      const colors = [
        "from-blue-600 to-cyan-600",
        "from-purple-600 to-pink-600",
        "from-orange-600 to-red-600",
        "from-green-600 to-emerald-600",
        "from-indigo-600 to-violet-600",
      ];
      let sum = 0;
      for (let i = 0; i < cls.code.length; i++) sum += cls.code.charCodeAt(i);
      const color = colors[sum % colors.length];

      return {
        id: clsIdStr,
        name: cls.name,
        code: cls.code,
        faculty: cls.assignedFaculty?.name || "Not Assigned",
        credits: cls.credits || 3,
        color,
        notices: noticesForClass,
        resources: resourcesForClass,
        assignments: assignmentsForClass,
      };
    });

    return NextResponse.json({ success: true, classes: formattedClasses });
  } catch (error) {
    console.error("Fetch student classes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch classes" },
      { status: 500 },
    );
  }
}
