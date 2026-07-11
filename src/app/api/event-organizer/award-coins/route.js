import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import ClubEvent from "@/models/ClubEvent";
import EventVolunteer from "@/models/EventVolunteer";
import User from "@/models/User";

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

    const { memberIds, coins, reason } = await req.json();

    if (
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length === 0 ||
      !coins
    ) {
      return NextResponse.json(
        { error: "Member IDs list and coin amount are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // 1. Update user profile coin balances
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $inc: { coins: coins } },
    );

    // 2. Increment volunteer coins for events managed by this organizer
    const activeEvents = await ClubEvent.find({ organizer: session.user.id });
    if (activeEvents.length > 0) {
      const activeEventIds = activeEvents.map((e) => e._id);
      await EventVolunteer.updateMany(
        {
          event: { $in: activeEventIds },
          user: { $in: memberIds },
        },
        { $inc: { coinsEarned: coins } },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully distributed ${coins} coins to ${memberIds.length} members.`,
    });
  } catch (error) {
    console.error("Award coins error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to award coins to members" },
      { status: 500 },
    );
  }
}
