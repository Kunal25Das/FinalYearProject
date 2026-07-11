import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";

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

    return NextResponse.json({
      success: true,
      settings: {
        description: club.description || "",
        category: club.category || "Technology",
        icon: club.icon || "💡",
        color: club.color || "from-blue-600 to-purple-600",
        achievements: club.achievements || [],
      },
    });
  } catch (error) {
    console.error("Fetch club settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch club settings" },
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

    const { description, category, icon, color, achievements } =
      await req.json();

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

    if (description !== undefined) club.description = description;
    if (category !== undefined) club.category = category;
    if (icon !== undefined) club.icon = icon;
    if (color !== undefined) club.color = color;
    if (achievements !== undefined) club.achievements = achievements;

    await club.save();

    return NextResponse.json({
      success: true,
      message: "Club settings updated successfully",
      settings: {
        description: club.description,
        category: club.category,
        icon: club.icon,
        color: club.color,
        achievements: club.achievements,
      },
    });
  } catch (error) {
    console.error("Save club settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save club settings" },
      { status: 500 },
    );
  }
}
