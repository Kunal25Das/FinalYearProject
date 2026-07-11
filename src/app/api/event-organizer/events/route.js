import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import ClubEvent from "@/models/ClubEvent";
import EventRegistration from "@/models/EventRegistration";
import EventVolunteer from "@/models/EventVolunteer";

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

    const events = await ClubEvent.find({ organizer: session.user.id }).sort({
      date: -1,
    });
    const eventIds = events.map((e) => e._id);

    const registrations = await EventRegistration.find({
      event: { $in: eventIds },
    });
    const volunteers = await EventVolunteer.find({
      event: { $in: eventIds },
    }).populate("user", "name email");

    const formattedEvents = events.map((e) => {
      const eIdStr = e._id.toString();

      const eventRegs = registrations
        .filter((r) => r.event.toString() === eIdStr)
        .map((r) => ({
          id: r._id.toString(),
          name: r.name,
          email: r.email,
          registeredAt: new Date(r.registeredAt).toISOString().split("T")[0],
          status: r.status,
        }));

      const eventVols = volunteers
        .filter((v) => v.event.toString() === eIdStr)
        .map((v) => ({
          id: v._id.toString(),
          name: v.user?.name || "Unknown",
          role: v.role,
        }));

      return {
        id: eIdStr,
        title: e.title,
        description: e.description || "",
        date: new Date(e.date).toISOString().split("T")[0],
        time: e.time,
        location: e.location,
        status: e.status,
        registrations: eventRegs.length,
        maxParticipants: e.maxParticipants || 100,
        volunteers: eventVols,
      };
    });

    return NextResponse.json({ success: true, events: formattedEvents });
  } catch (error) {
    console.error("Fetch organizer events error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
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

    const { title, description, date, time, location, maxParticipants } =
      await req.json();

    if (!title || !date || !time || !location) {
      return NextResponse.json(
        {
          error: "Required fields title, date, time, and location are missing",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    // Find club
    const club = await Club.findOne({
      $or: [
        { studentRepresentative: session.user.id },
        { facultyCoordinator: session.user.id },
      ],
    });

    const event = await ClubEvent.create({
      title,
      description: description || "",
      date: new Date(date),
      time,
      location,
      maxParticipants: maxParticipants || 100,
      organizer: session.user.id,
      club: club ? club._id : null,
      institute: session.user.instituteId,
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
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
    const eventId = searchParams.get("id");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Verify ownership and delete
    const result = await ClubEvent.deleteOne({
      _id: eventId,
      organizer: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Event not found or unauthorized to delete" },
        { status: 404 },
      );
    }

    // Clean up related registrations & volunteer entries
    await EventRegistration.deleteMany({ event: eventId });
    await EventVolunteer.deleteMany({ event: eventId });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete event" },
      { status: 500 },
    );
  }
}
