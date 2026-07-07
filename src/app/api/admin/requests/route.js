import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Institute from "@/models/Institute";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    // Fetch all pending requests first, order by newest
    const requests = await Institute.find({ status: "pending" }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("Fetch signup requests error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch signup requests" },
      { status: 500 },
    );
  }
}
