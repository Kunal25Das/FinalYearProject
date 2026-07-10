import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Class from "@/models/Class";
import Schedule from "@/models/Schedule";
import ScheduleOverride from "@/models/ScheduleOverride";
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

    const deptId = student.department;
    const instituteId = student.institute;

    // 1. Fetch student's assigned classes
    const classes = await Class.find({
      batch: student.batch,
      department: deptId,
      institute: instituteId,
    });

    const classCodes = classes.map((c) => c.code.toLowerCase());
    const classMapByCode = {};
    classes.forEach((c) => {
      classMapByCode[c.code.toLowerCase()] = c;
    });

    // 2. Fetch active timetables for HOD's uploaded batches
    const activeSchedules = await Schedule.find({
      department: deptId,
      institute: instituteId,
      batch: student.batch,
      status: "active",
    });

    // Resolve Faculty Emails/Names to readable Names
    const facultyUsers = await User.find({ role: "faculty" }, "name email");
    const facultyMap = {};
    facultyUsers.forEach((f) => {
      if (f.email) facultyMap[f.email.toLowerCase().trim()] = f.name;
      if (f.name) facultyMap[f.name.toLowerCase().trim()] = f.name;
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

      const dayName = daysOfWeek[currentDate.getDay()];
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

            if (classCodes.includes(slotSubjectLower)) {
              const matchedClass = classMapByCode[slotSubjectLower];
              const rawFac = (slot.faculty || "").toLowerCase().trim();
              const facultyName =
                facultyMap[rawFac] || slot.faculty || "Not Assigned";

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
                faculty: facultyName,
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
      classId: { $in: classes.map((c) => c._id) },
    })
      .populate("classId")
      .sort({ createdAt: -1 });

    // Apply overrides to dynamically generated slots
    const finalSchedules = [];
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
            rawDate: new Date(
              new Date(matchedOverride.newDate).setHours(0, 0, 0, 0),
            ),
            day: new Date(matchedOverride.newDate).toLocaleDateString("en-US", {
              weekday: "long",
            }),
            time: matchedOverride.newTime,
            room: slot.room,
            faculty: slot.faculty,
            status: "rescheduled",
            color: "from-orange-500 to-amber-500",
          });
        }
      } else {
        finalSchedules.push(slot);
      }
    });

    return NextResponse.json({ success: true, schedules: finalSchedules });
  } catch (error) {
    console.error("Fetch student schedules error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch student schedules" },
      { status: 500 },
    );
  }
}
