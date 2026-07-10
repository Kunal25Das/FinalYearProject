import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Class from "@/models/Class";
import Department from "@/models/Department";

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

    const deptDoc = await Department.findById(deptId);
    const defaultMaxLoad = deptDoc?.defaultMaxLoad || 16;

    // Fetch all users with role 'faculty' under this department
    const facultyList = await User.find({
      role: "faculty",
      department: deptId,
      institute: instituteId,
    }).sort({ name: 1 });

    const populatedFaculty = await Promise.all(
      facultyList.map(async (f) => {
        // Query assigned classes for this faculty member
        const assignedClassesDocs = await Class.find({
          assignedFaculty: f._id,
          department: deptId,
          institute: instituteId,
        });

        // Compute current load dynamically
        const currentLoad = assignedClassesDocs.reduce(
          (sum, cls) => sum + (cls.hoursPerWeek || 0),
          0,
        );

        const assignedClasses = assignedClassesDocs.map((cls) => ({
          code: cls.code,
          name: cls.name,
          batch: cls.batch,
        }));

        // Determine designation designationId
        const designation = f.designation || "Assistant Professor";
        let designationId = "assistant";
        if (designation.toLowerCase().includes("associate")) {
          designationId = "associate";
        } else if (designation.toLowerCase().includes("professor")) {
          designationId = "professor";
        }

        return {
          id: f._id.toString(),
          name: f.name,
          designation,
          designationId,
          email: f.email,
          phone: f.phone || "+91 98765 43210",
          specialization:
            f.specialization && f.specialization.length > 0
              ? f.specialization
              : ["General CSE"],
          qualification: f.qualification || "Ph.D. / M.Tech",
          experience: f.experience || "5 years",
          currentLoad,
          maxLoad: f.maxLoad || defaultMaxLoad,
          assignedClasses,
          publications: f.publications || 0,
          joinedDate: new Date(f.createdAt).getFullYear().toString(),
          avatar: null,
        };
      }),
    );

    return NextResponse.json({ success: true, faculty: populatedFaculty });
  } catch (error) {
    console.error("Fetch dept faculty error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch faculty list" },
      { status: 500 },
    );
  }
}
