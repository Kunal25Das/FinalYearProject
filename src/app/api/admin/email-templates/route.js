import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const templates = await EmailTemplate.find({ institute: instituteId }).sort(
      { createdAt: -1 },
    );

    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error("Fetch email templates error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load email templates" },
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

    const { name, subject, body } = await req.json();

    if (!name || !subject || !body) {
      return NextResponse.json(
        { error: "Name, subject, and body are required fields" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const template = await EmailTemplate.create({
      name,
      subject,
      body,
      institute: instituteId,
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error("Create email template error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save email template" },
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
        { error: "Template ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const instituteId = session.user.instituteId;

    const deleted = await EmailTemplate.findOneAndDelete({
      _id: id,
      institute: instituteId,
    });
    if (!deleted) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Delete email template error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete email template" },
      { status: 500 },
    );
  }
}
