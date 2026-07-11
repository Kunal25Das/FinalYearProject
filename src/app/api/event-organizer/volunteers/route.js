import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import ClubEvent from "@/models/ClubEvent";
import EventVolunteer from "@/models/EventVolunteer";
import User from "@/models/User";

export async function GET(_req) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      (!session.user.role === "event-organizer" &&
        !session.user.specialRoles?.includes("event-organizer"))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const events = await ClubEvent.find({ organizer: session.user.id });
    const eventIds = events.map((e) => e._id);

    const volunteers = await EventVolunteer.find({ event: { $in: eventIds } })
      .populate("event")
      .populate("user")
      .sort({ createdAt: -1 });

    const formattedVolunteers = volunteers.map((v) => ({
      id: v._id.toString(),
      userId: v.user?._id?.toString() || "",
      name: v.user?.name || "Unknown User",
      email: v.user?.email || "N/A",
      role: v.role,
      event: v.event?.title || "Unknown Event",
      eventId: v.event?._id?.toString() || "",
      tasks: v.tasks || [],
      coinsEarned: v.coinsEarned || 0,
      status: v.status,
    }));

    // Find all student users of the same institute to suggest as available members
    const availableMembers = await User.find({
      institute: session.user.instituteId,
      role: "student",
    }).select("name email coins");

    const formattedAvailable = availableMembers.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      coinsEarned: m.coins || 0,
    }));

    const eventsList = [
      { id: "all", name: "All Events" },
      ...events.map((e) => ({ id: e._id.toString(), name: e.title })),
    ];

    return NextResponse.json({
      success: true,
      volunteers: formattedVolunteers,
      availableMembers: formattedAvailable,
      events: eventsList,
    });
  } catch (error) {
    console.error("Fetch organizer volunteers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch volunteers" },
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
      (!session.user.role === "event-organizer" &&
        !session.user.specialRoles?.includes("event-organizer"))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, userId, role } = await req.json();

    if (!eventId || !userId) {
      return NextResponse.json(
        { error: "Event ID and User ID are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Verify organizer owns the event
    const event = await ClubEvent.findOne({
      _id: eventId,
      organizer: session.user.id,
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found or unauthorized to manage" },
        { status: 404 },
      );
    }

    // Check if user is already a volunteer for this event
    const existing = await EventVolunteer.findOne({
      event: eventId,
      user: userId,
    });
    if (existing) {
      return NextResponse.json(
        { error: "User is already assigned as a volunteer for this event" },
        { status: 400 },
      );
    }

    const volunteer = await EventVolunteer.create({
      event: eventId,
      user: userId,
      role: role || "Volunteer",
      tasks: [],
      coinsEarned: 0,
      status: "active",
    });

    return NextResponse.json({ success: true, volunteer });
  } catch (error) {
    console.error("Assign volunteer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign volunteer" },
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
      (!session.user.role === "event-organizer" &&
        !session.user.specialRoles?.includes("event-organizer"))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { volunteerId, tasks, status, role } = await req.json();

    if (!volunteerId) {
      return NextResponse.json(
        { error: "Volunteer ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const volunteer =
      await EventVolunteer.findById(volunteerId).populate("event");

    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 },
      );
    }

    // Verify ownership
    if (volunteer.event.organizer.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Unauthorized access" },
        { status: 403 },
      );
    }

    if (tasks !== undefined) {
      volunteer.tasks = tasks;
    }

    if (status !== undefined) {
      volunteer.status = status;
    }

    if (role !== undefined) {
      volunteer.role = role;
    }

    await volunteer.save();

    return NextResponse.json({ success: true, volunteer });
  } catch (error) {
    console.error("Update volunteer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update volunteer details" },
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
      (!session.user.role === "event-organizer" &&
        !session.user.specialRoles?.includes("event-organizer"))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const volunteerId = searchParams.get("id");

    if (!volunteerId) {
      return NextResponse.json(
        { error: "Volunteer ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const volunteer =
      await EventVolunteer.findById(volunteerId).populate("event");

    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 },
      );
    }

    // Verify ownership
    if (volunteer.event.organizer.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Unauthorized access" },
        { status: 403 },
      );
    }

    await EventVolunteer.deleteOne({ _id: volunteerId });

    return NextResponse.json({
      success: true,
      message: "Volunteer removed successfully",
    });
  } catch (error) {
    console.error("Delete volunteer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove volunteer" },
      { status: 500 },
    );
  }
}
