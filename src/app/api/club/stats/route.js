import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import ClubMembership from "@/models/ClubMembership";
import ClubEvent from "@/models/ClubEvent";
import EventVolunteer from "@/models/EventVolunteer";
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

    // 1. Resolve club info
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

    // 2. Query stats metrics
    const membersCount = await ClubMembership.countDocuments({
      club: club._id,
      status: "approved",
    });

    const pendingCount = await ClubMembership.countDocuments({
      club: club._id,
      status: "pending",
    });

    const upcomingEventsCount = await ClubEvent.countDocuments({
      club: club._id,
      status: "upcoming",
    });

    const clubEvents = await ClubEvent.find({ club: club._id });
    const clubEventIds = clubEvents.map((e) => e._id);

    const activeVolunteersCount = await EventVolunteer.countDocuments({
      event: { $in: clubEventIds },
      status: "active",
    });

    const volunteers = await EventVolunteer.find({
      event: { $in: clubEventIds },
    });
    const totalCoinsAwarded = volunteers.reduce(
      (acc, v) => acc + (v.coinsEarned || 0),
      0,
    );

    const clubData = {
      name: club.name,
      description: club.description || "",
      icon: club.icon || "💡",
      color: club.color || "from-blue-600 to-purple-600",
      members: membersCount,
      pendingRequests: pendingCount,
      totalCoinsAwarded: totalCoinsAwarded,
      upcomingEvents: upcomingEventsCount,
      activeVolunteers: activeVolunteersCount,
    };

    // 3. Pending requests list
    const pendingMemberships = await ClubMembership.find({
      club: club._id,
      status: "pending",
    })
      .populate("student", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedPending = pendingMemberships.map((pm) => ({
      id: pm._id.toString(),
      name: pm.student?.name || "Unknown Student",
      email: pm.student?.email || "N/A",
      requestedAt: new Date(pm.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      avatar: pm.student?.name?.charAt(0) || "👤",
    }));

    // 4. Generate dynamic recent activities timeline
    const approvedMemberships = await ClubMembership.find({
      club: club._id,
      status: "approved",
    })
      .populate("student", "name")
      .sort({ updatedAt: -1 })
      .limit(5);

    const memberActs = approvedMemberships.map((am) => ({
      id: `mem-${am._id}`,
      text: `New member joined: ${am.student?.name || "Unknown Student"}`,
      time: am.updatedAt,
      type: "member",
    }));

    const eventActs = clubEvents.slice(0, 5).map((e) => ({
      id: `ev-${e._id}`,
      text: `Event '${e.title}' registration status is ${e.status}`,
      time: e.createdAt,
      type: "event",
    }));

    const notices = await Notice.find({ club: club._id })
      .sort({ createdAt: -1 })
      .limit(5);
    const noticeActs = notices.map((n) => ({
      id: `nt-${n._id}`,
      text: `New notice posted: ${n.title}`,
      time: n.createdAt,
      type: "notice",
    }));

    const coinActs = volunteers
      .filter((v) => v.coinsEarned > 0)
      .slice(0, 5)
      .map((v) => ({
        id: `coin-${v._id}`,
        text: `${v.coinsEarned} coins awarded to volunteer team`,
        time: v.updatedAt,
        type: "coins",
      }));

    const merged = [...memberActs, ...eventActs, ...noticeActs, ...coinActs]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);

    const recentActivities = merged.map((act) => {
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

    return NextResponse.json({
      success: true,
      club: clubData,
      pendingRequests: formattedPending,
      recentActivities,
    });
  } catch (error) {
    console.error("Fetch club stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch club dashboard stats" },
      { status: 500 },
    );
  }
}
