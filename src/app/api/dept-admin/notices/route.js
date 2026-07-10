import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Notice from "@/models/Notice";

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

    // Fetch notices for this department
    const noticesDocs = await Notice.find({
      institute: instituteId,
      department: deptId.toString(),
      status: "active",
    }).sort({ createdAt: -1 });

    const priorityRevMap = {
      Urgent: "high",
      Important: "medium",
      Normal: "low",
    };

    const notices = noticesDocs.map((n) => {
      // Map audience
      let targetAudience = "all";
      if (n.batch) {
        targetAudience = "batch";
      } else if (n.audience === "Faculty") {
        targetAudience = "faculty";
      } else if (n.audience === "Students") {
        targetAudience = "students";
      }

      return {
        id: n._id.toString(),
        title: n.title,
        content: n.content,
        priority: priorityRevMap[n.priority] || "medium",
        targetAudience,
        targetBatch: n.batch || null,
        createdAt: new Date(n.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        createdBy: n.author || "Dr. HOD",
        views: 0, // Notice schema does not track view counts
        status: n.status === "active" ? "published" : "archived",
      };
    });

    return NextResponse.json({ success: true, notices });
  } catch (error) {
    console.error("Fetch dept notices error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notices" },
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

    const { title, content, priority, targetAudience, targetBatch } =
      await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required fields" },
        { status: 400 },
      );
    }

    await dbConnect();
    const deptId = session.user.department;
    const instituteId = session.user.instituteId;

    // Map priority
    const priorityMap = { high: "Urgent", medium: "Important", low: "Normal" };
    const mappedPriority = priorityMap[priority] || "Important";

    // Map audience
    let mappedAudience = "Department";
    if (targetAudience === "faculty") {
      mappedAudience = "Faculty";
    } else if (targetAudience === "students" || targetAudience === "batch") {
      mappedAudience = "Students";
    }

    const notice = await Notice.create({
      title,
      content,
      priority: mappedPriority,
      audience: mappedAudience,
      department: deptId.toString(),
      batch: targetAudience === "batch" ? targetBatch : null,
      author: session.user.name || "Dr. HOD",
      institute: instituteId,
      status: "active",
    });

    const priorityRevMap = {
      Urgent: "high",
      Important: "medium",
      Normal: "low",
    };

    return NextResponse.json({
      success: true,
      notice: {
        id: notice._id.toString(),
        title: notice.title,
        content: notice.content,
        priority: priorityRevMap[notice.priority] || "medium",
        targetAudience: targetAudience || "all",
        targetBatch: notice.batch || null,
        createdAt: new Date(notice.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        createdBy: notice.author || "Dr. HOD",
        views: 0,
        status: "published",
      },
    });
  } catch (error) {
    console.error("Create dept notice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to publish notice" },
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
        { error: "Notice ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const deptId = session.user.department;
    const instituteId = session.user.instituteId;

    const notice = await Notice.findOneAndDelete({
      _id: id,
      department: deptId.toString(),
      institute: instituteId,
    });

    if (!notice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete dept notice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete notice" },
      { status: 500 },
    );
  }
}
