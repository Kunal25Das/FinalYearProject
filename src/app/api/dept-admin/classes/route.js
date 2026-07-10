import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Class from "@/models/Class";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "dept-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const deptId = session.user.department;
    const instituteId = session.user.instituteId;

    if (!deptId || !instituteId) {
      return NextResponse.json(
        { error: "Department context missing" },
        { status: 400 },
      );
    }

    const classesDocs = await Class.find({
      department: deptId,
      institute: instituteId,
    })
      .populate("assignedFaculty", "name")
      .sort({ code: 1 });

    const classes = await Promise.all(
      classesDocs.map(async (cls) => {
        // Query dynamic students count matching this class's batch and department
        const studentsCount = await User.countDocuments({
          role: "student",
          department: deptId,
          institute: instituteId,
          batch: cls.batch,
        });

        return {
          id: cls._id.toString(),
          code: cls.code,
          name: cls.name,
          batch: cls.batch,
          credits: cls.credits,
          type: cls.type,
          hoursPerWeek: cls.hoursPerWeek,
          assignedFaculty: cls.assignedFaculty?.name || null,
          assignedFacultyId: cls.assignedFaculty?._id?.toString() || null,
          students: studentsCount,
        };
      }),
    );

    return NextResponse.json({ success: true, classes });
  } catch (error) {
    console.error("Fetch classes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch classes" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "dept-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, name, batch, credits, type, hoursPerWeek } = await req.json();

    if (!code || !name || !batch) {
      return NextResponse.json(
        { error: "Code, name, and batch are required fields" },
        { status: 400 },
      );
    }

    await dbConnect();
    const deptId = session.user.department;
    const instituteId = session.user.instituteId;

    // Check if class already exists in this department
    const existingClass = await Class.findOne({
      code: code.toUpperCase(),
      department: deptId,
      institute: instituteId,
    });

    if (existingClass) {
      return NextResponse.json(
        {
          error: `Class with code ${code.toUpperCase()} already exists in this department`,
        },
        { status: 400 },
      );
    }

    const newClass = await Class.create({
      code: code.toUpperCase(),
      name,
      batch,
      credits: parseInt(credits) || 3,
      type: type || "theory",
      hoursPerWeek: parseInt(hoursPerWeek) || 3,
      department: deptId,
      institute: instituteId,
    });

    return NextResponse.json({ success: true, class: newClass });
  } catch (error) {
    console.error("Create class error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create class" },
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

    const body = await req.json();
    const {
      id,
      code,
      name,
      batch,
      credits,
      type,
      hoursPerWeek,
      assignedFacultyId,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const deptId = session.user.department;
    const instituteId = session.user.instituteId;

    // Find class first
    const cls = await Class.findOne({
      _id: id,
      department: deptId,
      institute: instituteId,
    });
    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Prepare update object
    const updateData = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (batch !== undefined) updateData.batch = batch;
    if (credits !== undefined) updateData.credits = parseInt(credits);
    if (type !== undefined) updateData.type = type;
    if (hoursPerWeek !== undefined)
      updateData.hoursPerWeek = parseInt(hoursPerWeek);

    // Faculty assignment
    if (assignedFacultyId !== undefined) {
      if (assignedFacultyId === null || assignedFacultyId === "") {
        updateData.assignedFaculty = null;
      } else {
        // Verify faculty exists
        const faculty = await User.findOne({
          _id: assignedFacultyId,
          role: "faculty",
          department: deptId,
          institute: instituteId,
        });
        if (!faculty) {
          return NextResponse.json(
            { error: "Faculty member not found in this department" },
            { status: 404 },
          );
        }
        updateData.assignedFaculty = faculty._id;
      }
    }

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    ).populate("assignedFaculty", "name");

    const studentsCount = await User.countDocuments({
      role: "student",
      department: deptId,
      institute: instituteId,
      batch: updatedClass.batch,
    });

    return NextResponse.json({
      success: true,
      class: {
        id: updatedClass._id.toString(),
        code: updatedClass.code,
        name: updatedClass.name,
        batch: updatedClass.batch,
        credits: updatedClass.credits,
        type: updatedClass.type,
        hoursPerWeek: updatedClass.hoursPerWeek,
        assignedFaculty: updatedClass.assignedFaculty?.name || null,
        assignedFacultyId:
          updatedClass.assignedFaculty?._id?.toString() || null,
        students: studentsCount,
      },
    });
  } catch (error) {
    console.error("Update class error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update class" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "dept-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const deptId = session.user.department;
    const instituteId = session.user.instituteId;

    const cls = await Class.findOneAndDelete({
      _id: id,
      department: deptId,
      institute: instituteId,
    });

    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Delete class error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete class" },
      { status: 500 },
    );
  }
}
