import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Department from "@/models/Department";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "dept-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const deptId = session.user.department;

    if (!deptId) {
      return NextResponse.json(
        { error: "Department context missing" },
        { status: 400 },
      );
    }

    const dept = await Department.findById(deptId);
    if (!dept) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      defaultMaxLoad: dept.defaultMaxLoad || 16,
    });
  } catch (error) {
    console.error("Fetch department settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "dept-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { defaultMaxLoad } = await req.json();

    if (defaultMaxLoad === undefined) {
      return NextResponse.json(
        { error: "defaultMaxLoad is required" },
        { status: 400 },
      );
    }

    const parsedLoad = parseInt(defaultMaxLoad);
    if (isNaN(parsedLoad) || parsedLoad <= 0) {
      return NextResponse.json(
        { error: "Invalid defaultMaxLoad value" },
        { status: 400 },
      );
    }

    await dbConnect();
    const deptId = session.user.department;

    if (!deptId) {
      return NextResponse.json(
        { error: "Department context missing" },
        { status: 400 },
      );
    }

    const dept = await Department.findByIdAndUpdate(
      deptId,
      { $set: { defaultMaxLoad: parsedLoad } },
      { new: true },
    );

    if (!dept) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      defaultMaxLoad: dept.defaultMaxLoad,
      message: "Department settings updated successfully",
    });
  } catch (error) {
    console.error("Update department settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 },
    );
  }
}
