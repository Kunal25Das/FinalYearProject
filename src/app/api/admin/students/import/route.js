import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Batch from "@/models/Batch";
import Department from "@/models/Department";
import { hashPassword } from "@/lib/auth-utils";
import { sendOneTimePasswordEmail } from "@/lib/mail";
import ActivityLog from "@/models/ActivityLog";
import otpGenerator from "otp-generator";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { students, department, batch } = await req.json();

    if (
      !students ||
      !Array.isArray(students) ||
      students.length === 0 ||
      !department ||
      !batch
    ) {
      return NextResponse.json(
        { error: "Students array, department, and batch are required fields" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    // Fetch department details to resolve code
    const deptDoc = await Department.findById(department);
    const deptCode = deptDoc ? deptDoc.code : "Dept";

    // Auto-create Batch if it does not exist under this department and year
    let batchDoc = await Batch.findOne({
      year: batch,
      department: department,
      institute: instituteId,
    });

    if (!batchDoc) {
      batchDoc = await Batch.create({
        name: `${deptCode} Batch ${batch}`,
        year: batch,
        department: department,
        sections: ["A"],
        classAdvisor: "Not Assigned",
        institute: instituteId,
        status: "active",
      });

      // Write to ActivityLog
      await ActivityLog.create({
        action: "Batch automatically created during student import",
        details: `${deptCode} Batch ${batch}`,
        type: "batch",
        institute: instituteId,
      });
    }

    let importedCount = 0;
    const errors = [];

    for (const student of students) {
      const { name, email, rollNo } = student;
      if (!name || !email) {
        errors.push(`Skipped a row: missing name or email`);
        continue;
      }

      const normalizedEmail = email.trim().toLowerCase();

      try {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          errors.push(`Skipped ${normalizedEmail}: Email already registered`);
          continue;
        }

        // Generate temporary 8-char password
        const tempPassword = otpGenerator.generate(8, {
          digits: true,
          lowerCaseAlphabet: true,
          upperCaseAlphabet: true,
          specialChars: false,
        });

        // Create student
        await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password: hashPassword(tempPassword),
          role: "student",
          department: department, // References Department ObjectId directly
          batch: batch,
          rollNo: rollNo ? rollNo.trim().toUpperCase() : "",
          institute: instituteId,
          requiresPasswordUpdate: true,
          isApproved: true,
        });

        // Send credentials
        try {
          await sendOneTimePasswordEmail({
            email: normalizedEmail,
            name,
            role: "student",
            tempPassword,
          });
        } catch (emailErr) {
          console.error(
            `Failed to send credentials to ${normalizedEmail}:`,
            emailErr,
          );
        }

        importedCount++;
      } catch (err) {
        errors.push(`Error importing ${normalizedEmail}: ${err.message}`);
      }
    }

    // Write to ActivityLog
    await ActivityLog.create({
      action: "Students imported",
      details: `${importedCount} students - ${deptCode} Batch ${batch}`,
      type: "import",
      institute: instituteId,
    });

    return NextResponse.json({
      success: true,
      importedCount,
      errors,
      message: `Successfully imported ${importedCount} of ${students.length} students.`,
    });
  } catch (error) {
    console.error("Bulk student import error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process bulk import" },
      { status: 500 },
    );
  }
}
