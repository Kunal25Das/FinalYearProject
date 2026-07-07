import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
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

    const events = await Event.find({ institute: instituteId }).sort({
      date: 1,
    });

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Get calendar events error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load events" },
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

    const { title, date, type, broadcast } = await req.json();

    if (!title || !date) {
      return NextResponse.json(
        { error: "Title and Date are required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const event = await Event.create({
      title,
      date: new Date(date),
      type: type || "Academic",
      institute: instituteId,
    });

    // Write to ActivityLog
    await ActivityLog.create({
      action: "New calendar event scheduled",
      details: `${title} - ${new Date(date).toLocaleDateString()}`,
      type: "calendar",
      institute: instituteId,
    });

    // Broadcast as general notice if requested
    if (broadcast) {
      const dateStr = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      await Notice.create({
        title: `Calendar Event: ${title}`,
        content: `Official notice: A new ${type} schedule/event has been marked on the campus calendar.\n\nEvent: ${title}\nScheduled Date: ${dateStr}\nCategory: ${type}\n\nPlease update your timelines accordingly.`,
        priority: "Important",
        audience: "All",
        author: "Administration Office",
        publishedAt: new Date(),
        institute: instituteId,
      });
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Create calendar event error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to schedule event" },
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
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const event = await Event.findOneAndDelete({
      _id: id,
      institute: instituteId,
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Write to ActivityLog
    await ActivityLog.create({
      action: "Calendar event cancelled",
      details: event.title,
      type: "calendar",
      institute: instituteId,
    });

    return NextResponse.json({
      success: true,
      message: "Event removed successfully",
    });
  } catch (error) {
    console.error("Delete calendar event error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete event" },
      { status: 500 },
    );
  }
}
