import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Batch from "@/models/Batch";

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

    // Fetch batches in the department
    const batchesDocs = await Batch.find({
      department: deptId,
      institute: instituteId,
      status: "active",
    }).sort({ year: -1 });

    const batches = batchesDocs.map((b) => ({
      id: b.year, // Using batch year as the ID for compatibility
      name: `Batch ${b.year} (${b.name})`,
      sections: b.sections || [],
      classAdvisor: b.classAdvisor || "Not Assigned",
    }));

    return NextResponse.json({ success: true, batches });
  } catch (error) {
    console.error("Fetch dept batches error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch batches" },
      { status: 500 },
    );
  }
}
