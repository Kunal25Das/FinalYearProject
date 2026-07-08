import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Batch from "@/models/Batch";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    // Fetch all batches and populate the referenced Department
    const rawBatches = await Batch.find({ institute: instituteId })
      .populate("department")
      .sort({ year: -1, name: 1 });

    const batches = await Promise.all(
      rawBatches.map(async (batch) => {
        const deptId = batch.department?._id || batch.department;

        // Query dynamic students list matching this batch's department reference and year
        const students = await User.find({
          role: "student",
          institute: instituteId,
          department: deptId,
          batch: batch.year,
        }).select("name email rollNo department batch");

        const studentDocs = students.map((s) => ({
          id: s._id.toString(),
          name: s.name,
          rollNo: s.rollNo || "N/A",
          email: s.email,
          section: "A", // Default section
        }));

        return {
          id: batch._id.toString(),
          name: batch.name,
          year: batch.year,
          department: deptId ? deptId.toString() : "",
          departmentCode: batch.department?.code || "N/A",
          departmentName: batch.department?.name || "N/A",
          departmentFull: batch.department?.name || "N/A",
          totalStudents: students.length,
          activeStudents: students.length,
          sections: batch.sections || [],
          classAdvisor: batch.classAdvisor || "Not Assigned",
          createdAt: new Date(batch.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          status: batch.status,
          students: studentDocs,
        };
      }),
    );

    return NextResponse.json({ success: true, batches });
  } catch (error) {
    console.error("Fetch batches error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch batches" },
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

    const { name, year, department, sections, classAdvisor } = await req.json();

    if (!name || !year || !department) {
      return NextResponse.json(
        { error: "Name, year, and department are required fields" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const batch = await Batch.create({
      name,
      year,
      department,
      sections: sections && sections.length > 0 ? sections : [],
      classAdvisor: classAdvisor || "Not Assigned",
      institute: instituteId,
    });

    // Write to ActivityLog
    await ActivityLog.create({
      action: "New batch created",
      details: name,
      type: "batch",
      institute: instituteId,
    });

    return NextResponse.json({ success: true, batch });
  } catch (error) {
    console.error("Create batch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create batch" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Batch ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const batch = await Batch.findOneAndDelete({
      _id: id,
      institute: instituteId,
    });
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Write to ActivityLog
    await ActivityLog.create({
      action: "Batch deleted",
      details: batch.name,
      type: "batch",
      institute: instituteId,
    });

    return NextResponse.json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("Delete batch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete batch" },
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

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Batch ID and status are required fields" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const batch = await Batch.findOneAndUpdate(
      { _id: id, institute: instituteId },
      { status },
      { new: true },
    );

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Write to ActivityLog
    await ActivityLog.create({
      action: `Batch status updated to ${status}`,
      details: batch.name,
      type: "batch",
      institute: instituteId,
    });

    return NextResponse.json({ success: true, batch });
  } catch (error) {
    console.error("Update batch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update batch" },
      { status: 500 },
    );
  }
}
