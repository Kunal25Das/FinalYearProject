import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Class from "@/models/Class";
import Resource from "@/models/Resource";
import Notice from "@/models/Notice";
import Schedule from "@/models/Schedule";
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

    // Fetch classes assigned to this faculty
    const classesDocs = await Class.find({
      assignedFaculty: facultyId,
      institute: instituteId,
    }).sort({ code: 1 });

    // Fetch active department schedules to aggregate class slot times
    const activeSchedules = await Schedule.find({
      department: deptId,
      institute: instituteId,
      status: "active",
    });

    const colors = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-blue-500",
    ];

    const classes = await Promise.all(
      classesDocs.map(async (cls, index) => {
        // Query resources for this class
        const resourcesDocs = await Resource.find({ classId: cls._id }).sort({
          createdAt: -1,
        });
        const resources = resourcesDocs.map((r) => ({
          id: r._id.toString(),
          title: r.title,
          description: r.description || "",
          type: r.type,
          date: new Date(r.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          downloads: r.downloads || 0,
          fileSize: r.fileSize || "0 KB",
          fileUrl: r.fileUrl || "",
        }));

        // Query notices for this class
        const noticesDocs = await Notice.find({
          classId: cls._id,
          status: "active",
        }).sort({ createdAt: -1 });

        const notices = noticesDocs.map((n) => ({
          id: n._id.toString(),
          title: n.title,
          content: n.content,
          date: new Date(n.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          priority: n.priority ? n.priority.toLowerCase() : "info",
          pinned: n.pinned || false,
        }));

        // Aggregate schedule string and room from loaded timetables
        const slots = [];
        const roomsList = [];
        activeSchedules.forEach((sched) => {
          if (sched.batch === cls.batch) {
            sched.scheduleData.forEach((slot) => {
              const slotFaculty = (slot.faculty || "").toLowerCase().trim();
              const matchesEmail =
                session.user.email &&
                slotFaculty === session.user.email.toLowerCase().trim();
              const matchesName =
                slotFaculty.includes(facultyName.toLowerCase()) ||
                slotFaculty === facultyName.toLowerCase();

              if (
                slot.subject.toLowerCase() === cls.code.toLowerCase() &&
                (matchesEmail || matchesName)
              ) {
                // e.g. Mon - 9:00 AM
                const dayAbbr = slot.day.substring(0, 3);
                const timeStart = slot.time.split("-")[0].trim();
                slots.push(`${dayAbbr} ${timeStart}`);

                if (slot.room && slot.room !== "N/A" && slot.room !== "TBD") {
                  roomsList.push(slot.room);
                }
              }
            });
          }
        });

        const scheduleString =
          slots.length > 0 ? slots.join(", ") : "Not Scheduled Yet";
        const uniqueRooms = [...new Set(roomsList)];
        const roomString =
          uniqueRooms.length > 0 ? uniqueRooms.join(", ") : "Lab/Room TBD";

        const studentsCount = await User.countDocuments({
          role: "student",
          department: cls.department,
          institute: instituteId,
          batch: cls.batch,
        });

        return {
          id: cls._id.toString(),
          subject: cls.name,
          code: cls.code,
          batch: `Batch ${cls.batch}`,
          students: studentsCount,
          schedule: scheduleString,
          room: roomString,
          color: colors[index % colors.length],
          resources,
          notices,
        };
      }),
    );

    return NextResponse.json({ success: true, classes });
  } catch (error) {
    console.error("Fetch faculty classes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch classes" },
      { status: 500 },
    );
  }
}

// POST: Share a resource
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, type, classId } = await req.json();

    if (!title || !classId) {
      return NextResponse.json(
        { error: "Title and Class ID are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Create the resource
    const newResource = await Resource.create({
      title,
      description,
      type: type || "notes",
      classId,
      faculty: session.user.id,
      fileName: title.toLowerCase().replace(/\s+/g, "_") + ".pdf", // Mock file info
      fileSize: "1.2 MB",
      fileUrl: "/mock/file.pdf",
    });

    return NextResponse.json({
      success: true,
      resource: {
        id: newResource._id.toString(),
        title: newResource.title,
        description: newResource.description || "",
        type: newResource.type,
        date: new Date(newResource.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        downloads: 0,
      },
    });
  } catch (error) {
    console.error("Create resource error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to share resource" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a resource
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("id");

    if (!resourceId) {
      return NextResponse.json(
        { error: "Resource ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Delete the resource
    const deleted = await Resource.findOneAndDelete({
      _id: resourceId,
      faculty: session.user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Resource not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Resource deleted" });
  } catch (error) {
    console.error("Delete resource error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete resource" },
      { status: 500 },
    );
  }
}
