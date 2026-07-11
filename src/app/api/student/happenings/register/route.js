import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import ClubEvent from "@/models/ClubEvent";
import EventRegistration from "@/models/EventRegistration";
import User from "@/models/User";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, teamName, teamSize } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Verify event exists
    const event = await ClubEvent.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if student is already registered for this event
    const existing = await EventRegistration.findOne({
      event: eventId,
      student: session.user.id,
    });

    if (existing) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 400 },
      );
    }

    // Retrieve student info
    let student = await User.findById(session.user.id);
    if (!student && session.user.email) {
      student = await User.findOne({ email: session.user.email });
    }

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 },
      );
    }

    const registration = await EventRegistration.create({
      event: eventId,
      student: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone || "N/A",
      status: "confirmed",
      teamName: teamName || null,
      teamSize: teamSize || null,
    });

    return NextResponse.json({ success: true, registration });
  } catch (error) {
    console.error("Student event registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register for the event" },
      { status: 500 },
    );
  }
}
