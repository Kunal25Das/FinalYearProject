import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import ClubMembership from "@/models/ClubMembership";
import ClubEvent from "@/models/ClubEvent";

export async function GET(_req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 1. Fetch active clubs of this institute
    const clubs = await Club.find({
      institute: session.user.instituteId,
      status: "active",
    });

    const clubIds = clubs.map((c) => c._id);

    // 2. Fetch logged in student memberships
    const studentMemberships = await ClubMembership.find({
      student: session.user.id,
    });

    // 3. Fetch all approved memberships to compute counts
    const allApprovedMembers = await ClubMembership.find({
      club: { $in: clubIds },
      status: "approved",
    });

    // 4. Fetch all events for these clubs
    const allEvents = await ClubEvent.find({ club: { $in: clubIds } });

    // 5. Map formatting matching student CommunityTab catalog items
    const formattedClubs = clubs.map((c) => {
      const cIdStr = c._id.toString();

      const memberRecord = studentMemberships.find(
        (m) => m.club.toString() === cIdStr,
      );
      const isJoined = memberRecord?.status === "approved";
      const membershipStatus = memberRecord ? memberRecord.status : "none";

      const clubMembersCount = allApprovedMembers.filter(
        (m) => m.club.toString() === cIdStr,
      ).length;

      const clubEventsList = allEvents.filter(
        (e) => e.club?.toString() === cIdStr,
      );
      const upcomingEventsList = clubEventsList.filter(
        (e) => e.status === "upcoming",
      );

      return {
        id: cIdStr,
        name: c.name,
        description: c.description || "",
        members: clubMembersCount,
        events: clubEventsList.length,
        category: c.category || "Technology",
        icon: c.icon || "💡",
        color: c.color || "from-blue-600 to-purple-600",
        upcomingEvents: upcomingEventsList.map((e) => ({
          id: e._id.toString(),
          name: e.title,
          date: new Date(e.date).toISOString().split("T")[0],
        })),
        achievements: c.achievements || [],
        isJoined,
        membershipStatus,
      };
    });

    return NextResponse.json({ success: true, clubs: formattedClubs });
  } catch (error) {
    console.error("Fetch student clubs list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch clubs list" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clubId, action } = await req.json();

    if (!clubId || !action) {
      return NextResponse.json(
        { error: "Club ID and action (join/leave) are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Verify club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    if (action === "join") {
      // Create a pending membership request
      const existing = await ClubMembership.findOne({
        club: clubId,
        student: session.user.id,
      });

      if (existing) {
        if (existing.status === "approved") {
          return NextResponse.json(
            { error: "You are already a member of this club" },
            { status: 400 },
          );
        }
        if (existing.status === "pending") {
          return NextResponse.json(
            { error: "Your membership request is already pending" },
            { status: 400 },
          );
        }
        // If they left, recreate
        existing.status = "pending";
        await existing.save();
        return NextResponse.json({ success: true, membership: existing });
      } else {
        const membership = await ClubMembership.create({
          club: clubId,
          student: session.user.id,
          status: "pending",
          role: "Member",
        });
        return NextResponse.json({ success: true, membership });
      }
    } else if (action === "leave") {
      // Remove membership
      const result = await ClubMembership.deleteOne({
        club: clubId,
        student: session.user.id,
      });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: "You are not a member of this club" },
          { status: 400 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Successfully left the club",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action parameter" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Club join toggle error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process club join/leave action" },
      { status: 500 },
    );
  }
}
