import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Opportunity from "@/models/Opportunity";
import ActivityLog from "@/models/ActivityLog";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const opportunity = await Opportunity.findOne({
        _id: id,
        institute: instituteId,
      });
      if (!opportunity) {
        return NextResponse.json(
          { error: "Opportunity not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, opportunity });
    }

    const opportunities = await Opportunity.find({
      institute: instituteId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, opportunities });
  } catch (error) {
    console.error("Fetch opportunities error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch opportunities" },
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

    const {
      title,
      company,
      type,
      location,
      salary,
      deadline,
      description,
      eligibility,
      departments,
      featured,
    } = await req.json();

    if (!title || !company || !type || !deadline || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const opportunity = await Opportunity.create({
      title,
      company,
      type,
      location: location || "On-Campus",
      salary: salary || "TBD",
      deadline: new Date(deadline),
      description,
      eligibility: eligibility || "All students eligible",
      departments: departments || ["All"],
      featured: featured || false,
      institute: instituteId,
    });

    // Write to ActivityLog
    await ActivityLog.create({
      action: "Opportunity posted",
      details: `${company} - ${title}`,
      type: "notice", // category it fits
      institute: instituteId,
    });

    return NextResponse.json({ success: true, opportunity });
  } catch (error) {
    console.error("Create opportunity error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to post opportunity" },
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
        { error: "Opportunity ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const opportunity = await Opportunity.findOneAndDelete({
      _id: id,
      institute: instituteId,
    });
    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 },
      );
    }

    // Write to ActivityLog
    await ActivityLog.create({
      action: "Opportunity deleted",
      details: `${opportunity.company} - ${opportunity.title}`,
      type: "notice",
      institute: instituteId,
    });

    return NextResponse.json({
      success: true,
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    console.error("Delete opportunity error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete opportunity" },
      { status: 500 },
    );
  }
}
