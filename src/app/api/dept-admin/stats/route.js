import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Class from "@/models/Class";
import Batch from "@/models/Batch";
import Notice from "@/models/Notice";
import Department from "@/models/Department";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "dept-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const deptId = session.user.department;
    const instituteId = session.user.instituteId;

    if (!deptId || !instituteId) {
      return NextResponse.json(
        { error: "Department or Institute context missing" },
        { status: 400 },
      );
    }

    // Fetch department details
    const department = await Department.findById(deptId);
    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 },
      );
    }

    // Counts
    const totalFaculty = await User.countDocuments({
      role: { $in: ["faculty", "dept-admin"] },
      department: deptId,
      institute: instituteId,
    });

    const totalStudents = await User.countDocuments({
      role: "student",
      department: deptId,
      institute: instituteId,
    });

    const totalClasses = await Class.countDocuments({
      department: deptId,
      institute: instituteId,
    });

    const totalBatches = await Batch.countDocuments({
      department: deptId,
      institute: instituteId,
    });

    // Recent Notices
    const rawNotices = await Notice.find({
      institute: instituteId,
      $or: [
        { department: deptId.toString() },
        { department: "" },
        { audience: "All" },
      ],
      status: "active",
    })
      .sort({ createdAt: -1 })
      .limit(3);

    const priorityMap = { Urgent: "high", Important: "medium", Normal: "low" };

    const recentNotices = rawNotices.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      date: new Date(n.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      priority: priorityMap[n.priority] || "medium",
    }));

    // Dynamic Pending Actions
    const unassignedClasses = await Class.find({
      department: deptId,
      institute: instituteId,
      assignedFaculty: null,
    }).limit(2);

    const pendingActions = [];
    let actionId = 1;

    unassignedClasses.forEach((cls) => {
      pendingActions.push({
        id: actionId++,
        title: `Assign faculty to ${cls.code} - ${cls.name}`,
        type: "assignment",
        urgent: true,
      });
    });

    // Fetch active batches to check schedules
    const activeBatches = await Batch.find({
      department: deptId,
      institute: instituteId,
      status: "active",
    });

    // Mock other HOD-specific actions if list is short
    if (pendingActions.length < 3) {
      pendingActions.push({
        id: actionId++,
        title: "Review and approve new faculty registration requests",
        type: "approval",
        urgent: false,
      });
      pendingActions.push({
        id: actionId++,
        title: "Submit Department Annual Syllabus Review",
        type: "schedule",
        urgent: true,
      });
    }

    // HOD Today's Schedule (sensible preset events for a HOD)
    const todaySchedule = [
      {
        time: "09:00 AM",
        event: "HOD Weekly Briefing",
        location: "Admin Block",
      },
      {
        time: "11:00 AM",
        event: "Department Faculty Meeting",
        location: "Conference Room",
      },
      {
        time: "02:00 PM",
        event: "Student Grievance & Feedback",
        location: "HOD Office",
      },
      {
        time: "04:00 PM",
        event: "Curriculum Advisory Board",
        location: "Meeting Hall",
      },
    ];

    return NextResponse.json({
      success: true,
      department: {
        name: department.name,
        code: department.code,
        totalFaculty,
        totalStudents,
        totalClasses,
        batches: totalBatches,
      },
      recentNotices,
      pendingActions,
      todaySchedule,
    });
  } catch (error) {
    console.error("Fetch dept stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch department statistics" },
      { status: 500 },
    );
  }
}
