import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import ClubMembership from "@/models/ClubMembership";
import User from "@/models/User";

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

    const memberships = await ClubMembership.find({ club: club._id })
      .populate("student", "name email coins")
      .sort({ createdAt: -1 });

    const formattedMembers = memberships
      .filter((m) => m.status === "approved")
      .map((m) => ({
        id: m._id.toString(),
        userId: m.student?._id?.toString() || "",
        name: m.student?.name || "Unknown Student",
        email: m.student?.email || "N/A",
        role: m.role || "Member",
        joinedAt: m.joinedAt
          ? new Date(m.joinedAt).toISOString().split("T")[0]
          : new Date(m.createdAt).toISOString().split("T")[0],
        coinsEarned: m.student?.coins || 0,
        avatar: m.student?.name?.charAt(0) || "👤",
      }));

    const formattedPending = memberships
      .filter((m) => m.status === "pending")
      .map((m) => ({
        id: m._id.toString(),
        name: m.student?.name || "Unknown Student",
        email: m.student?.email || "N/A",
        requestedAt: new Date(m.createdAt).toISOString().split("T")[0],
        avatar: m.student?.name?.charAt(0) || "👤",
      }));

    return NextResponse.json({
      success: true,
      members: formattedMembers,
      pendingRequests: formattedPending,
    });
  } catch (error) {
    console.error("Fetch club members error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch club members" },
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

    const { membershipId, action, role } = await req.json();

    if (!membershipId || !action) {
      return NextResponse.json(
        { error: "Membership ID and action parameters are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const membership =
      await ClubMembership.findById(membershipId).populate("club");

    if (!membership) {
      return NextResponse.json(
        { error: "Membership request not found" },
        { status: 404 },
      );
    }

    // Verify ownership
    const isRep =
      membership.club.studentRepresentative.toString() === session.user.id;
    const isAdv =
      membership.club.facultyCoordinator?.toString() === session.user.id;
    if (!isRep && !isAdv) {
      return NextResponse.json(
        { error: "Forbidden: Unauthorized access to this club" },
        { status: 403 },
      );
    }

    if (action === "approve") {
      membership.status = "approved";
      membership.joinedAt = new Date();
    } else if (action === "reject") {
      membership.status = "rejected";
    } else if (action === "change-role") {
      if (!role) {
        return NextResponse.json(
          { error: "Role string is required" },
          { status: 400 },
        );
      }
      membership.role = role;

      // Dynamic role side effects:
      // If a student's role inside the club is updated to "Event Organizer",
      // we also add "event-organizer" to their user specialRoles so they can see the dashboard switch!
      if (role === "Event Organizer") {
        await User.findByIdAndUpdate(membership.student, {
          $addToSet: { specialRoles: "event-organizer" },
        });
      }
    } else {
      return NextResponse.json(
        { error: "Invalid action parameter" },
        { status: 400 },
      );
    }

    await membership.save();

    return NextResponse.json({ success: true, membership });
  } catch (error) {
    console.error("Update membership status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update membership status" },
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
    const membershipId = searchParams.get("id");

    if (!membershipId) {
      return NextResponse.json(
        { error: "Membership ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const membership =
      await ClubMembership.findById(membershipId).populate("club");

    if (!membership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 },
      );
    }

    // Verify ownership
    const isRep =
      membership.club.studentRepresentative.toString() === session.user.id;
    const isAdv =
      membership.club.facultyCoordinator?.toString() === session.user.id;
    if (!isRep && !isAdv) {
      return NextResponse.json(
        { error: "Forbidden: Unauthorized access to this club" },
        { status: 403 },
      );
    }

    await ClubMembership.deleteOne({ _id: membershipId });

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove club member error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove member" },
      { status: 500 },
    );
  }
}
