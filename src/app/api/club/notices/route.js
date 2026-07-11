import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import Notice from "@/models/Notice";

export async function GET(_req) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      (!session.user.role === "club-admin" &&
        !session.user.specialRoles?.includes("club-admin") &&
        !session.user.specialRoles?.includes("club-advisor"))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const club = await Club.findOne({
      $or: [
        { studentRepresentative: session.user.id },
        { facultyCoordinator: session.user.id },
      ],
    });

    if (!club) {
      return NextResponse.json(
        { error: "No club associated with this account" },
        { status: 404 },
      );
    }

    const notices = await Notice.find({ club: club._id }).sort({
      createdAt: -1,
    });

    const formattedNotices = notices.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      content: n.content,
      type: n.type || "info",
      createdAt: new Date(n.publishedAt || n.createdAt)
        .toISOString()
        .split("T")[0],
      pinned: n.pinned || false,
    }));

    return NextResponse.json({ success: true, notices: formattedNotices });
  } catch (error) {
    console.error("Fetch club notices error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch club notices" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      (!session.user.role === "club-admin" &&
        !session.user.specialRoles?.includes("club-admin") &&
        !session.user.specialRoles?.includes("club-advisor"))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, type, pinned } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content fields are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const club = await Club.findOne({
      $or: [
        { studentRepresentative: session.user.id },
        { facultyCoordinator: session.user.id },
      ],
    });

    if (!club) {
      return NextResponse.json(
        { error: "No club associated with this account" },
        { status: 404 },
      );
    }

    const notice = await Notice.create({
      title,
      content,
      type: type || "info",
      pinned: pinned || false,
      audience: "Club",
      club: club._id,
      author: club.name,
      institute: session.user.instituteId,
    });

    return NextResponse.json({ success: true, notice });
  } catch (error) {
    console.error("Create club notice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create notice" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      (!session.user.role === "club-admin" &&
        !session.user.specialRoles?.includes("club-admin") &&
        !session.user.specialRoles?.includes("club-advisor"))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noticeId, title, content, type, pinned } = await req.json();

    if (!noticeId) {
      return NextResponse.json(
        { error: "Notice ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const notice = await Notice.findById(noticeId).populate("club");

    if (!notice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    // Verify ownership
    const isRep =
      notice.club.studentRepresentative.toString() === session.user.id;
    const isAdv =
      notice.club.facultyCoordinator?.toString() === session.user.id;
    if (!isRep && !isAdv) {
      return NextResponse.json(
        { error: "Forbidden: Unauthorized access to this club's notice" },
        { status: 403 },
      );
    }

    if (title !== undefined) notice.title = title;
    if (content !== undefined) notice.content = content;
    if (type !== undefined) notice.type = type;
    if (pinned !== undefined) notice.pinned = pinned;

    await notice.save();

    return NextResponse.json({ success: true, notice });
  } catch (error) {
    console.error("Update club notice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notice" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      (!session.user.role === "club-admin" &&
        !session.user.specialRoles?.includes("club-admin") &&
        !session.user.specialRoles?.includes("club-advisor"))
    ) {
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

    const notice = await Notice.findById(noticeId).populate("club");

    if (!notice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    // Verify ownership
    const isRep =
      notice.club.studentRepresentative.toString() === session.user.id;
    const isAdv =
      notice.club.facultyCoordinator?.toString() === session.user.id;
    if (!isRep && !isAdv) {
      return NextResponse.json(
        { error: "Forbidden: Unauthorized access to this club's notice" },
        { status: 403 },
      );
    }

    await Notice.deleteOne({ _id: noticeId });

    return NextResponse.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete club notice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete notice" },
      { status: 500 },
    );
  }
}
