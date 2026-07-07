import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Department from "@/models/Department";
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

    // Fetch all departments populated with HOD details
    const departments = await Department.find({ institute: instituteId })
      .populate("hod", "name email")
      .sort({ name: 1 });

    // Fetch all faculty (eligible for HOD appointment)
    const faculty = await User.find({
      institute: instituteId,
      role: { $in: ["faculty", "dept-admin"] },
    })
      .select("name email department")
      .sort({ name: 1 });

    return NextResponse.json({ success: true, departments, faculty });
  } catch (error) {
    console.error("Fetch departments error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load departments" },
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

    const { name, code, hodId } = await req.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and Code are required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    // Check if code already exists for this institute
    const existing = await Department.findOne({
      code: code.toUpperCase(),
      institute: instituteId,
    });
    if (existing) {
      return NextResponse.json(
        { error: "A department with this code already exists" },
        { status: 400 },
      );
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      hod: hodId || null,
      institute: instituteId,
    });

    if (hodId) {
      // Appoint user as dept-admin HOD
      await User.findByIdAndUpdate(hodId, {
        role: "dept-admin",
        department: code.toUpperCase(),
      });
    }

    // Log Activity
    await ActivityLog.create({
      action: "New department chartered",
      details: `${name} (${code.toUpperCase()})`,
      type: "faculty",
      institute: instituteId,
    });

    return NextResponse.json({ success: true, department });
  } catch (error) {
    console.error("Create department error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create department" },
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

    if (!id) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 },
      );
    }

    const { name, hodId, status } = await req.json();

    await dbConnect();
    const instituteId = session.user.instituteId;

    const dept = await Department.findOne({ _id: id, institute: instituteId });
    if (!dept) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 },
      );
    }

    const oldHodId = dept.hod ? dept.hod.toString() : null;

    if (name) dept.name = name;
    if (status) dept.status = status;

    // Update HOD reference
    if (hodId !== undefined) {
      dept.hod = hodId || null;
    }

    await dept.save();

    // If HOD changed, handle role updates
    if (hodId !== undefined && oldHodId !== hodId) {
      // 1. Demote old HOD back to faculty if they are no longer HOD of other departments
      if (oldHodId) {
        const otherDeptAsHod = await Department.find({
          hod: oldHodId,
          status: "active",
          institute: instituteId,
        });

        if (otherDeptAsHod.length === 0) {
          await User.findByIdAndUpdate(oldHodId, { role: "faculty" });
        }
      }

      // 2. Promote new HOD to dept-admin
      if (hodId) {
        await User.findByIdAndUpdate(hodId, {
          role: "dept-admin",
          department: dept.code,
        });
      }
    }

    // Log Activity
    await ActivityLog.create({
      action: "Department configurations updated",
      details: dept.name,
      type: "faculty",
      institute: instituteId,
    });

    return NextResponse.json({ success: true, department: dept });
  } catch (error) {
    console.error("Update department error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update department" },
      { status: 500 },
    );
  }
}
