import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import _Department from "@/models/Department";
import ActivityLog from "@/models/ActivityLog";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const role = searchParams.get("role") || "";

    const query = { institute: instituteId, role: { $ne: "super-admin" } };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { rollNo: { $regex: search, $options: "i" } },
      ];
    }

    // Department filter
    if (department && department !== "all") {
      query.department = department;
    }

    // Role filter (checks both primary role and special roles)
    if (role && role !== "all") {
      const orConditions = [{ role: role }];
      // Special roles are only applicable if they match specific string tokens
      if (["club-admin", "event-organizer", "club-advisor"].includes(role)) {
        orConditions.push({ specialRoles: role });
      }
      query.$or = orConditions;
    }

    const users = await User.find(query)
      .populate("department", "name code")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
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

    const { userId, name, email, department, specialRoles, isDisabled } =
      await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const user = await User.findOne({ _id: userId, institute: instituteId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (department !== undefined) user.department = department || undefined;
    if (specialRoles !== undefined) user.specialRoles = specialRoles;
    if (isDisabled !== undefined) user.isDisabled = isDisabled;

    await user.save();

    await ActivityLog.create({
      action: "User account modified",
      details: `${user.name} (${user.email}) - status/roles updated`,
      type: "faculty",
      institute: instituteId,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 },
    );
  }
}
