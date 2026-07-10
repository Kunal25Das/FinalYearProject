import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Notice from "@/models/Notice";
import Class from "@/models/Class";

// GET: Fetch faculty-authored notices and class lists for posting dropdowns
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

    // Fetch notices posted by this faculty
    const noticesDocs = await Notice.find({
      author: facultyId,
      status: "active",
    })
      .populate("classId")
      .sort({ createdAt: -1 });

    const notices = noticesDocs.map((n) => {
      let priorityVal = "info";
      if (n.priority === "Important") priorityVal = "important";
      else if (n.priority === "Urgent") priorityVal = "urgent";

      return {
        id: n._id.toString(),
        title: n.title,
        content: n.content,
        classId: n.classId ? n.classId._id.toString() : "all",
        className: n.classId ? n.classId.name : "All Classes",
        priority: priorityVal,
        pinned: n.pinned || false,
        date: new Date(n.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        views: n.views || 0,
      };
    });

    return NextResponse.json({ success: true, notices, myClasses });
  } catch (error) {
    console.error("Fetch faculty notices error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notices" },
      { status: 500 },
    );
  }
}

// POST: Create a class announcement notice
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, classId, priority, pinned } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and Content are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Map priority
    let priorityEnum = "Normal";
    if (priority === "important") priorityEnum = "Important";
    else if (priority === "urgent") priorityEnum = "Urgent";

    const noticeData = {
      title,
      content,
      audience: classId && classId !== "all" ? "Class" : "Faculty", // Class notices
      priority: priorityEnum,
      pinned: pinned || false,
      author: session.user.id,
      institute: session.user.instituteId,
      department: session.user.department,
    };

    if (classId && classId !== "all") {
      noticeData.classId = classId;
    }

    const newNotice = await Notice.create(noticeData);

    return NextResponse.json({
      success: true,
      notice: {
        id: newNotice._id.toString(),
        title: newNotice.title,
        content: newNotice.content,
        classId: newNotice.classId ? newNotice.classId.toString() : "all",
        className:
          classId && classId !== "all" ? "Class Announcement" : "All Classes",
        priority: priority || "info",
        pinned: newNotice.pinned || false,
        date: new Date(newNotice.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        views: 0,
      },
    });
  } catch (error) {
    console.error("Create notice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create announcement notice" },
      { status: 500 },
    );
  }
}

// PUT: Edit notice details
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, content, classId, priority, pinned } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Notice ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (pinned !== undefined) updateData.pinned = pinned;

    if (priority) {
      let priorityEnum = "Normal";
      if (priority === "important") priorityEnum = "Important";
      else if (priority === "urgent") priorityEnum = "Urgent";
      updateData.priority = priorityEnum;
    }

    if (classId) {
      if (classId === "all") {
        updateData.audience = "Faculty";
        updateData.$unset = { classId: "" };
      } else {
        updateData.audience = "Class";
        updateData.classId = classId;
      }
    }

    let updated;
    if (updateData.$unset) {
      const unsetFields = updateData.$unset;
      delete updateData.$unset;
      updated = await Notice.findOneAndUpdate(
        { _id: id, author: session.user.id },
        { $set: updateData, $unset: unsetFields },
        { new: true },
      );
    } else {
      updated = await Notice.findOneAndUpdate(
        { _id: id, author: session.user.id },
        { $set: updateData },
        { new: true },
      );
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Notice not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, notice: updated });
  } catch (error) {
    console.error("Edit notice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to edit notice" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a notice
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const noticeId = searchParams.get("id");

    if (!noticeId) {
      return NextResponse.json(
        { error: "Notice ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Mark as archived or delete completely
    const deleted = await Notice.findOneAndUpdate(
      { _id: noticeId, author: session.user.id },
      { $set: { status: "archived" } },
      { new: true },
    );

    if (!deleted) {
      return NextResponse.json(
        { error: "Notice not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Notice archived" });
  } catch (error) {
    console.error("Delete notice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete notice" },
      { status: 500 },
    );
  }
}
