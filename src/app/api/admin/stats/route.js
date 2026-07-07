import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Institute from "@/models/Institute";
import ApprovalRequest from "@/models/ApprovalRequest";
import ActivityLog from "@/models/ActivityLog";
import Opportunity from "@/models/Opportunity";
import Batch from "@/models/Batch";
import Event from "@/models/Event";
import Club from "@/models/Club";
import Department from "@/models/Department";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    // Fetch College details
    const college = await Institute.findById(instituteId);
    if (!college) {
      return NextResponse.json(
        { error: "Institute not found" },
        { status: 404 },
      );
    }

    // Dynamic Counts
    const totalStudents = await User.countDocuments({
      role: "student",
      institute: instituteId,
    });

    const totalFaculty = await User.countDocuments({
      role: "faculty",
      institute: instituteId,
    });

    // Count active approved clubs
    const totalClubs = await Club.countDocuments({
      status: "active",
      institute: instituteId,
    });

    // Count active departments
    const departmentsCount = await Department.countDocuments({
      status: "active",
      institute: instituteId,
    });

    // Pending Approvals List
    const pendingApprovals = await ApprovalRequest.find({
      status: "pending",
      institute: instituteId,
    }).sort({ createdAt: -1 });

    // Recent Activities list
    const recentActivities = await ActivityLog.find({
      institute: instituteId,
    })
      .sort({ createdAt: -1 })
      .limit(6);

    // Dynamic Upcoming Events from custom Events and Opportunities
    const customEvents = await Event.find({
      institute: instituteId,
    })
      .sort({ date: 1 })
      .limit(5);

    const activeOpps = await Opportunity.find({
      institute: instituteId,
      status: "active",
    })
      .sort({ deadline: 1 })
      .limit(3);

    const combinedEvents = [];

    customEvents.forEach((e) => {
      combinedEvents.push({
        id: e._id.toString(),
        name: e.title,
        date: new Date(e.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        type: e.type,
        rawDate: new Date(e.date),
      });
    });

    activeOpps.forEach((opp) => {
      combinedEvents.push({
        id: opp._id.toString(),
        name: `Drive: ${opp.company} (${opp.title})`,
        date: new Date(opp.deadline).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        type: opp.type,
        rawDate: new Date(opp.deadline),
      });
    });

    // Sort by date chronologically
    combinedEvents.sort((a, b) => a.rawDate - b.rawDate);

    //Default fallbacks if empty

    const upcomingEvents = combinedEvents.slice(0, 5);

    // Generate smart code
    const rawName = college.name.trim();
    const words = rawName.split(/\s+/);
    let code = "COL";
    if (words.length === 1) {
      code =
        rawName.length <= 6
          ? rawName.toUpperCase()
          : rawName.slice(0, 3).toUpperCase();
    } else {
      code = words
        .map((w) => w[0])
        .join("")
        .toUpperCase();
    }

    return NextResponse.json({
      success: true,
      data: {
        college: {
          name: college.name,
          code: code,
          address: college.address,
          website: college.website,
          departments: departmentsCount,
          totalStudents,
          totalFaculty,
          totalClubs: totalClubs, // actual count from database without mock values
        },
        pendingApprovals,
        recentActivities,
        upcomingEvents,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load dashboard stats" },
      { status: 500 },
    );
  }
}
