import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Notice from "@/models/Notice";
import ActivityLog from "@/models/ActivityLog";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const notice = await Notice.findOne({ _id: id, institute: instituteId });
      if (!notice) {
        return NextResponse.json(
          { error: "Notice not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, notice });
    }

    const notices = await Notice.find({ institute: instituteId }).sort({
      pinned: -1,
      createdAt: -1,
    });

    return NextResponse.json({ success: true, notices });
  } catch (error) {
    console.error("Fetch notices error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notices" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      content,
      priority,
      audience,
      department,
      pinned,
      expiresAt,
      author,
    } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required fields" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const notice = await Notice.create({
      title,
      content,
      priority: priority || "Normal",
      audience: audience || "All",
      department: department || "",
      pinned: pinned || false,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      author: author || "Administration",
      institute: instituteId,
    });

    // Write to ActivityLog
    await ActivityLog.create({
      action: "Notice published",
      details: title.length > 30 ? `${title.slice(0, 30)}...` : title,
      type: "notice",
      institute: instituteId,
    });

    return NextResponse.json({ success: true, notice });
  } catch (error) {
    console.error("Create notice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to publish notice" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
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
    const instituteId = session.user.instituteId;

    const notice = await Notice.findOneAndDelete({
      _id: id,
      institute: instituteId,
    });
    if (!notice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    // Write to ActivityLog
    await ActivityLog.create({
      action: "Notice deleted",
      details:
        notice.title.length > 30
          ? `${notice.title.slice(0, 30)}...`
          : notice.title,
      type: "notice",
      institute: instituteId,
    });

    return NextResponse.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete notice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete notice" },
      { status: 500 },
    );
  }
}
