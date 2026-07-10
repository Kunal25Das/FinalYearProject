import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Schedule from "@/models/Schedule";
import User from "@/models/User";

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
        { error: "Department context missing" },
        { status: 400 },
      );
    }

    // Fetch schedules and populate uploadedBy user
    const rawSchedules = await Schedule.find({
      department: deptId,
      institute: instituteId,
    })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    const schedules = rawSchedules.map((s) => ({
      id: s._id.toString(),
      batch: s.batch,
      semester: s.semester,
      fileName: s.fileName,
      uploadedAt: new Date(s.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      uploadedBy: s.uploadedBy?.name || "Dr. HOD",
      status: s.status,
      scheduleData: s.scheduleData,
    }));

    return NextResponse.json({ success: true, schedules });
  } catch (error) {
    console.error("Fetch schedules error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch schedules" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "dept-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const batch = formData.get("batch");
    const semester = formData.get("semester");

    if (!file || !batch || !semester) {
      return NextResponse.json(
        { error: "File, batch, and semester are required fields" },
        { status: 400 },
      );
    }

    await dbConnect();
    const deptId = session.user.department;
    const instituteId = session.user.instituteId;

    // Parse the file text
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length <= 1) {
      return NextResponse.json(
        { error: "The uploaded file does not contain schedule entries" },
        { status: 400 },
      );
    }

    // Custom CSV parser
    const scheduleData = [];

    // We expect headers: Day, Time, Subject, Faculty, Room
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex split to handle quotes
      const columns = line
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((col) => col.trim().replace(/^"|"$/g, ""));

      if (columns.length >= 3) {
        scheduleData.push({
          day: columns[0],
          time: columns[1],
          subject: columns[2],
          faculty: columns[3] || "Not Assigned",
          room: columns[4] || "N/A",
        });
      }
    }

    if (scheduleData.length === 0) {
      return NextResponse.json(
        { error: "No valid schedule entries found in the file" },
        { status: 400 },
      );
    }

    // Set any previous active schedules for this batch and semester to replaced
    await Schedule.updateMany(
      {
        department: deptId,
        institute: instituteId,
        batch,
        semester,
        status: "active",
      },
      { $set: { status: "replaced" } },
    );

    // Create new active schedule
    const schedule = await Schedule.create({
      department: deptId,
      institute: instituteId,
      batch,
      semester,
      fileName: file.name,
      uploadedBy: session.user.id,
      scheduleData,
      status: "active",
    });

    return NextResponse.json({
      success: true,
      schedule: {
        id: schedule._id.toString(),
        batch: schedule.batch,
        semester: schedule.semester,
        fileName: schedule.fileName,
        uploadedAt: new Date(schedule.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        uploadedBy: session.user.name || "Dr. HOD",
        status: schedule.status,
        scheduleData: schedule.scheduleData,
      },
    });
  } catch (error) {
    console.error("Upload schedule error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process schedule upload" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "dept-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const deptId = session.user.department;
    const instituteId = session.user.instituteId;

    const schedule = await Schedule.findOneAndDelete({
      _id: id,
      department: deptId,
      institute: instituteId,
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Delete schedule error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete schedule" },
      { status: 500 },
    );
  }
}
