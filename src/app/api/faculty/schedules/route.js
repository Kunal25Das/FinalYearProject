import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Class from "@/models/Class";
import Schedule from "@/models/Schedule";
import ScheduleOverride from "@/models/ScheduleOverride";
import User from "@/models/User";
import Notice from "@/models/Notice";

// GET: Generate schedules dynamically including overrides
export async function GET(req) {
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

    // 1. Fetch faculty's assigned classes
    const classes = await Class.find({
      assignedFaculty: facultyId,
      institute: instituteId,
    });

    const classCodes = classes.map((c) => c.code.toLowerCase());
    const classMapByCode = {};
    classes.forEach((c) => {
      classMapByCode[c.code.toLowerCase()] = c;
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

    // 2. Fetch active timetables for HOD's uploaded batches
    const activeSchedules = await Schedule.find({
      department: deptId,
      institute: instituteId,
      status: "active",
    });

    // 3. Generate schedules for next 14 days
    const schedulesList = [];
    const today = new Date();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const dayName = daysOfWeek[currentDate.getDay()]; // e.g. "Monday"
      const dateString = currentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      // Find slots matching this day
      activeSchedules.forEach((sched) => {
        sched.scheduleData.forEach((slot) => {
          if (slot.day.toLowerCase() === dayName.toLowerCase()) {
            const slotSubjectLower = slot.subject.toLowerCase();
            const slotFaculty = (slot.faculty || "").toLowerCase().trim();

            const matchesEmail =
              session.user.email &&
              slotFaculty === session.user.email.toLowerCase().trim();
            const matchesName =
              slotFaculty.includes(facultyName.toLowerCase()) ||
              slotFaculty === facultyName.toLowerCase();

            // Faculty matches (by name or email) and assigned to this class code
            if (
              classCodes.includes(slotSubjectLower) &&
              (matchesEmail || matchesName)
            ) {
              const matchedClass = classMapByCode[slotSubjectLower];
              schedulesList.push({
                id: `${sched._id}-${slot._id}-${currentDate.getTime()}`,
                classId: matchedClass._id.toString(),
                subject: matchedClass.name,
                code: matchedClass.code,
                batch: `Batch ${sched.batch}`,
                rawBatch: sched.batch,
                date: dateString,
                rawDate: new Date(currentDate.setHours(0, 0, 0, 0)),
                day: slot.day,
                time: slot.time,
                room: slot.room || "TBD",
                students: studentCountMap[sched.batch] || 0,
                status: "scheduled",
                color: "from-blue-500 to-cyan-500",
              });
            }
          }
        });
      });
    }

    // 4. Fetch schedule overrides (cancellations and reschedules)
    const overrides = await ScheduleOverride.find({
      faculty: facultyId,
    })
      .populate("classId")
      .sort({ createdAt: -1 });

    // Apply overrides to dynamically generated slots
    const finalSchedules = [];

    // Map overrides by date-time-classId identifier for easy lookup
    const overridesMap = {};
    overrides.forEach((o) => {
      if (o.classId) {
        const oDateStr = new Date(o.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const key = `${o.classId._id.toString()}_${oDateStr}_${o.originalTime}`;
        overridesMap[key] = o;
      }
    });

    schedulesList.forEach((slot) => {
      const overrideKey = `${slot.classId}_${slot.date}_${slot.time}`;
      const matchedOverride = overridesMap[overrideKey];

      if (matchedOverride) {
        if (matchedOverride.actionType === "cancel") {
          finalSchedules.push({
            ...slot,
            status: "cancelled",
            cancelReason: matchedOverride.reason || "No reason specified",
          });
        } else if (matchedOverride.actionType === "reschedule") {
          finalSchedules.push({
            ...slot,
            status: "rescheduled",
            rescheduleReason: matchedOverride.reason || "No reason specified",
          });

          // Add a new rescheduled slot on the new date/time if it falls in our range
          const newDateStr = new Date(
            matchedOverride.newDate,
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          finalSchedules.push({
            id: `resched-${matchedOverride._id}`,
            classId: slot.classId,
            subject: slot.subject,
            code: slot.code,
            batch: slot.batch,
            rawBatch: slot.rawBatch,
            date: newDateStr,
            day: daysOfWeek[new Date(matchedOverride.newDate).getDay()],
            time: matchedOverride.newTime,
            room: slot.room,
            students: slot.students,
            status: "scheduled",
            isRescheduledTarget: true,
            originalDate: slot.date,
            rescheduleReason: matchedOverride.reason,
            color: "from-purple-500 to-pink-500",
          });
        }
      } else {
        finalSchedules.push(slot);
      }
    });

    // 5. Structure overrides history
    const history = overrides.map((o) => ({
      id: o._id.toString(),
      action: o.actionType === "cancel" ? "Cancelled" : "Rescheduled",
      subject: o.classId ? o.classId.name : "Unknown Class",
      date: new Date(o.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      reason: o.reason || "No reason specified",
      notifiedAt: new Date(o.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      newDate: o.newDate
        ? new Date(o.newDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
      newTime: o.newTime || null,
    }));

    return NextResponse.json({
      success: true,
      schedules: finalSchedules,
      history,
    });
  } catch (error) {
    console.error("Fetch dynamic faculty schedules error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch schedules" },
      { status: 500 },
    );
  }
}

// POST: Add schedule action/override (cancel/reschedule)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      classId,
      actionType,
      date,
      originalTime,
      newDate,
      newTime,
      reason,
    } = await req.json();

    if (!classId || !actionType || !date) {
      return NextResponse.json(
        { error: "Class ID, Action Type, and Date are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Create the override
    const override = await ScheduleOverride.create({
      classId,
      faculty: session.user.id,
      actionType,
      date: new Date(date),
      originalTime: originalTime || "09:00 AM - 10:00 AM",
      newDate: newDate ? new Date(newDate) : null,
      newTime: newTime || null,
      reason: reason || "",
    });

    // Create a dynamic notice about this schedule change for the class!
    const targetClass = await Class.findById(classId);
    if (targetClass) {
      const noticeTitle =
        actionType === "cancel"
          ? `Class Cancelled: ${targetClass.name} on ${new Date(date).toLocaleDateString()}`
          : `Class Rescheduled: ${targetClass.name} from ${new Date(date).toLocaleDateString()} to ${new Date(newDate).toLocaleDateString()}`;

      const noticeContent =
        actionType === "cancel"
          ? `The class session of ${targetClass.name} (${targetClass.code}) scheduled for ${new Date(date).toLocaleDateString()} at ${originalTime} has been CANCELLED. Reason: ${reason || "Not specified"}.`
          : `The class session of ${targetClass.name} (${targetClass.code}) scheduled for ${new Date(date).toLocaleDateString()} at ${originalTime} has been RESCHEDULED to ${new Date(newDate).toLocaleDateString()} at ${newTime}. Reason: ${reason || "Not specified"}.`;

      await Notice.create({
        title: noticeTitle,
        content: noticeContent,
        audience: "Class",
        classId,
        priority: "Urgent",
        author: session.user.id,
        institute: session.user.instituteId,
      });
    }

    return NextResponse.json({
      success: true,
      override,
      message: `Class ${actionType === "cancel" ? "cancelled" : "rescheduled"} successfully.`,
    });
  } catch (error) {
    console.error("Create schedule override error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit schedule action" },
      { status: 500 },
    );
  }
}
