import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import ClubEvent from "@/models/ClubEvent";
import EventRegistration from "@/models/EventRegistration";

export async function GET(_req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 1. Fetch upcoming events
    const events = await ClubEvent.find({ status: "upcoming" })
      .populate("club")
      .populate("organizer", "name");

    // 2. Fetch logged in student's registrations
    const registrations = await EventRegistration.find({
      student: session.user.id,
    });
    const registeredEventIds = registrations.map((r) => r.event.toString());

    // 3. Format happenings items matching frontend structure
    const formattedEvents = events.map((e) => {
      let category = "Event";
      let image = "bg-gradient-to-br from-blue-600 to-purple-600";

      const titleLower = e.title.toLowerCase();
      if (
        titleLower.includes("hack") ||
        titleLower.includes("code") ||
        titleLower.includes("symposium")
      ) {
        category = "Competition";
        image = "bg-gradient-to-br from-green-600 to-emerald-600";
      } else if (
        titleLower.includes("fest") ||
        titleLower.includes("aura") ||
        titleLower.includes("music")
      ) {
        category = "Festival";
        image = "bg-gradient-to-br from-pink-600 to-rose-600";
      } else if (
        titleLower.includes("career") ||
        titleLower.includes("job") ||
        titleLower.includes("fair")
      ) {
        category = "Career";
        image = "bg-gradient-to-br from-orange-600 to-yellow-600";
      }

      return {
        id: e._id.toString(),
        title: e.title,
        category,
        date: new Date(e.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: e.time,
        location: e.location,
        description: e.description || "",
        image,
        tags: [category, "Campus", "Activity"],
        organizer: e.club?.name || e.organizer?.name || "Campus Club",
        registrationLink: "#",
        isRegistered: registeredEventIds.includes(e._id.toString()),
      };
    });

    return NextResponse.json({ success: true, happenings: formattedEvents });
  } catch (error) {
    console.error("Fetch student happenings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch campus events list" },
      { status: 500 },
    );
  }
}
