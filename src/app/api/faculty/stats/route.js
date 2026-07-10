import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Class from "@/models/Class";
import Schedule from "@/models/Schedule";
import Notice from "@/models/Notice";
import Resource from "@/models/Resource";
import ScheduleOverride from "@/models/ScheduleOverride";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const facultyId = session.user.id;
    const facultyName = session.user.name;
    const deptId = session.user.department;
    const instituteId = session.user.instituteId;

    // 1. Fetch assigned classes
    const classes = await Class.find({
      assignedFaculty: facultyId,
      institute: instituteId,
    });

    const totalClasses = classes.length;

    // Dynamically calculate unique students across all unique batches of these classes
    const uniqueBatches = [...new Set(classes.map((c) => c.batch))];
    let totalStudents = 0;
    if (uniqueBatches.length > 0) {
      totalStudents = await User.countDocuments({
        role: "student",
        department: deptId,
        institute: instituteId,
        batch: { $in: uniqueBatches },
      });
    }

    // 2. Fetch today's schedule from uploaded timetables
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayDay = daysOfWeek[new Date().getDay()]; // e.g. "Wednesday"

    // Find active schedules for this department
    const activeSchedules = await Schedule.find({
      department: deptId,
      institute: instituteId,
      status: "active",
    });

    const todaysSlots = [];
    activeSchedules.forEach((sched) => {
      sched.scheduleData.forEach((slot) => {
        if (slot.day.toLowerCase() === todayDay.toLowerCase()) {
          // Check if faculty name or email matches (case-insensitive check)
          const slotFaculty = (slot.faculty || "").toLowerCase().trim();
          const matchesEmail =
            session.user.email &&
            slotFaculty === session.user.email.toLowerCase().trim();
          const matchesName =
            slotFaculty.includes(facultyName.toLowerCase()) ||
            slotFaculty === facultyName.toLowerCase();

          if (matchesEmail || matchesName) {
            todaysSlots.push({
              id: slot._id ? slot._id.toString() : Math.random().toString(),
              subject: slot.subject,
              batch: `Batch ${sched.batch}`,
              time: slot.time,
              room: slot.room || "N/A",
              status: "upcoming", // status will be determined on frontend
            });
          }
        }
      });
    });

    // 3. Count notices posted by this faculty
    const noticesCount = await Notice.countDocuments({
      author: facultyId,
      status: "active",
    });

    // 4. Fetch recent activities
    const [recentResources, recentNotices, recentOverrides] = await Promise.all(
      [
        Resource.find({ faculty: facultyId })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate("classId"),
        Notice.find({ author: facultyId })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate("classId"),
        ScheduleOverride.find({ faculty: facultyId })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate("classId"),
      ],
    );

    const recentActivities = [];
    recentResources.forEach((r) => {
      recentActivities.push({
        id: r._id.toString(),
        text: `Shared resource "${r.title}" for ${r.classId?.name || "class"}`,
        time: formatRelativeTime(r.createdAt),
        type: "resource",
        rawDate: r.createdAt,
      });
    });

    recentNotices.forEach((n) => {
      recentActivities.push({
        id: n._id.toString(),
        text: `Posted notice: "${n.title}"`,
        time: formatRelativeTime(n.createdAt),
        type: "notice",
        rawDate: n.createdAt,
      });
    });

    recentOverrides.forEach((o) => {
      recentActivities.push({
        id: o._id.toString(),
        text: `${o.actionType === "cancel" ? "Cancelled" : "Rescheduled"} class on ${new Date(o.date).toLocaleDateString()}`,
        time: formatRelativeTime(o.createdAt),
        type: "cancel",
        rawDate: o.createdAt,
      });
    });

    // Sort all activities by date descending
    recentActivities.sort((a, b) => b.rawDate - a.rawDate);
    const finalActivities = recentActivities.slice(0, 5);

    return NextResponse.json({
      success: true,
      faculty: {
        name: facultyName,
        department: session.user.departmentName || "Department",
        totalClasses,
        totalStudents,
        upcomingClasses: todaysSlots.length,
        pendingNotices: noticesCount,
      },
      todaysSchedule: todaysSlots,
      recentActivities: finalActivities,
    });
  } catch (error) {
    console.error("Fetch faculty stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 },
    );
  }
}

function formatRelativeTime(date) {
  const diffMs = new Date() - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins || 1}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}
