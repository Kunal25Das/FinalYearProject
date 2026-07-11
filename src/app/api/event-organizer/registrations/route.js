import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import ClubEvent from "@/models/ClubEvent";
import EventRegistration from "@/models/EventRegistration";

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

    const registrations = await EventRegistration.find({
      event: { $in: eventIds },
    })
      .populate("event")
      .sort({ createdAt: -1 });

    const formattedRegs = registrations.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      email: r.email,
      phone: r.phone || "N/A",
      event: r.event?.title || "Unknown Event",
      eventId: r.event?._id?.toString() || "",
      registeredAt: new Date(r.registeredAt).toLocaleString(),
      status: r.status,
      teamName: r.teamName,
      teamSize: r.teamSize,
    }));

    const eventsFilterList = [
      { id: "all", name: "All Events" },
      ...events.map((e) => ({ id: e._id.toString(), name: e.title })),
    ];

    return NextResponse.json({
      success: true,
      registrations: formattedRegs,
      events: eventsFilterList,
    });
  } catch (error) {
    console.error("Fetch organizer registrations error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch registrations" },
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

    const { registrationId, status } = await req.json();

    if (!registrationId || !status) {
      return NextResponse.json(
        { error: "Registration ID and target status are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const registration =
      await EventRegistration.findById(registrationId).populate("event");

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    // Verify organizer owns the event
    if (registration.event.organizer.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Unauthorized access" },
        { status: 403 },
      );
    }

    registration.status = status;
    await registration.save();

    return NextResponse.json({ success: true, registration });
  } catch (error) {
    console.error("Update registration status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update registration status" },
      { status: 500 },
    );
  }
}
