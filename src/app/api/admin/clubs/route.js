import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    // Fetch all clubs populated with representative details
    const clubs = await Club.find({ institute: instituteId })
      .populate("studentRepresentative", "name email")
      .populate("facultyCoordinator", "name email")
      .sort({ createdAt: -1 });

    // Fetch potential student representatives
    const students = await User.find({
      institute: instituteId,
      role: { $in: ["student", "club-admin"] },
    })
      .select("name email")
      .sort({ name: 1 });

    // Fetch potential faculty coordinators
    const faculty = await User.find({
      institute: instituteId,
      role: "faculty",
    })
      .select("name email")
      .sort({ name: 1 });

    return NextResponse.json({ success: true, clubs, students, faculty });
  } catch (error) {
    console.error("Fetch clubs error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load clubs" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, studentRepresentativeId, facultyCoordinatorId } =
      await req.json();

    if (!name || !studentRepresentativeId || !facultyCoordinatorId) {
      return NextResponse.json(
        {
          error:
            "Name, Student Representative, and Faculty Coordinator are required",
        },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const club = await Club.create({
      name,
      description,
      studentRepresentative: studentRepresentativeId,
      facultyCoordinator: facultyCoordinatorId,
      institute: instituteId,
    });

    // Appoint student as club-admin role
    await User.findByIdAndUpdate(studentRepresentativeId, {
      role: "club-admin",
    });

    // Log Activity
    await ActivityLog.create({
      action: "New club created",
      details: `${name} (Representative: ${studentRepresentativeId})`,
      type: "club",
      institute: instituteId,
    });

    return NextResponse.json({ success: true, club });
  } catch (error) {
    console.error("Create club error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create club" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    if (!id || action !== "disband") {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const club = await Club.findOne({ _id: id, institute: instituteId });
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    club.status = "disbanded";
    await club.save();

    // Revert the student rep's role back to standard student, if they aren't managing other clubs
    const otherActiveClubs = await Club.find({
      studentRepresentative: club.studentRepresentative,
      status: "active",
      institute: instituteId,
    });

    if (otherActiveClubs.length === 0) {
      await User.findByIdAndUpdate(club.studentRepresentative, {
        role: "student",
      });
    }

    // Log Activity
    await ActivityLog.create({
      action: "Club disbanded",
      details: club.name,
      type: "club",
      institute: instituteId,
    });

    return NextResponse.json({
      success: true,
      message: "Club disbanded successfully",
    });
  } catch (error) {
    console.error("Disband club error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to disband club" },
      { status: 500 },
    );
  }
}
