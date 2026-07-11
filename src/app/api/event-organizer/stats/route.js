import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import ClubEvent from "@/models/ClubEvent";
import EventRegistration from "@/models/EventRegistration";
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

    // 1. Resolve club info
    let club = await Club.findOne({
      $or: [
        { studentRepresentative: session.user.id },
        { facultyCoordinator: session.user.id },
      ],
    });

    if (!club) {
      // Fallback
      club = await Club.findOne({ institute: session.user.instituteId });
    }

    const clubName = club ? club.name : "Campus Activity Club";

    // 2. Fetch events created by this organizer
    const events = await ClubEvent.find({ organizer: session.user.id }).sort({
      date: -1,
    });
    const eventIds = events.map((e) => e._id);

    // 3. Fetch registrations and volunteer data
    const registrations = await EventRegistration.find({
      event: { $in: eventIds },
    }).sort({
      createdAt: -1,
    });
    const volunteers = await EventVolunteer.find({
      event: { $in: eventIds },
    }).sort({
      createdAt: -1,
    });

    const activeEventsCount = events.filter(
      (e) => e.status === "upcoming",
    ).length;
    const coinsAwardedCount = volunteers.reduce(
      (acc, v) => acc + (v.coinsEarned || 0),
      0,
    );

    // 4. Format events list
    const formattedEvents = events.slice(0, 5).map((e) => {
      const eventRegsCount = registrations.filter(
        (r) => r.event.toString() === e._id.toString(),
      ).length;
      const eventVolunteersCount = volunteers.filter(
        (v) => v.event.toString() === e._id.toString(),
      ).length;

      return {
        id: e._id.toString(),
        name: e.title,
        date: new Date(e.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        registrations: eventRegsCount,
        status: e.status,
        volunteers: eventVolunteersCount,
      };
    });

    // 5. Generate dynamic recent activities timeline
    const regActivities = registrations.slice(0, 5).map((r) => {
      const ev = events.find((e) => e._id.toString() === r.event.toString());
      return {
        id: `reg-${r._id}`,
        text: `New registration for ${ev?.title || "Event"}`,
        time: r.createdAt,
        type: "registration",
      };
    });

    const volActivities = volunteers.slice(0, 5).map((v) => {
      const ev = events.find((e) => e._id.toString() === v.event.toString());
      return {
        id: `vol-${v._id}`,
        text: `Volunteer assigned to ${ev?.title || "Event"}`,
        time: v.createdAt,
        type: "volunteer",
      };
    });

    const coinActivities = volunteers
      .filter((v) => v.coinsEarned > 0)
      .slice(0, 5)
      .map((v) => {
        return {
          id: `coin-${v._id}`,
          text: `${v.coinsEarned} coins awarded to volunteer team`,
          time: v.updatedAt,
          type: "coins",
        };
      });

    const mergedActivities = [
      ...regActivities,
      ...volActivities,
      ...coinActivities,
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 4);

    const recentActivities = mergedActivities.map((act) => {
      const diffMs = new Date() - new Date(act.time);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);
      let timeStr = "just now";
      if (diffDays > 0)
        timeStr = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      else if (diffHrs > 0)
        timeStr = `${diffHrs} hr${diffHrs > 1 ? "s" : ""} ago`;
      else if (diffMins > 0)
        timeStr = `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

      return {
        id: act.id,
        text: act.text,
        time: timeStr,
        type: act.type,
      };
    });

    const stats = {
      clubName,
      totalEventsManaged: events.length,
      activeEvents: activeEventsCount,
      totalRegistrations: registrations.length,
      volunteersAssigned: volunteers.length,
      coinsAwarded: coinsAwardedCount,
    };

    return NextResponse.json({
      success: true,
      stats,
      myEvents: formattedEvents,
      recentActivities,
    });
  } catch (error) {
    console.error("Fetch organizer stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard overview stats" },
      { status: 500 },
    );
  }
}
