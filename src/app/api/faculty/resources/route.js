import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import Resource from "@/models/Resource";
import Class from "@/models/Class";

// GET: Fetch all resources uploaded by the logged-in faculty
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const facultyId = session.user.id;
    const instituteId = session.user.instituteId;

    // Fetch classes list for the class selector dropdown
    const classes = await Class.find({
      assignedFaculty: facultyId,
      institute: instituteId,
    });

    const myClasses = [
      { id: "all", name: "All Classes" },
      ...classes.map((c) => ({
        id: c._id.toString(),
        name: `${c.name} (${c.batch})`,
      })),
    ];

    // Fetch all resources uploaded by this faculty
    const resourcesDocs = await Resource.find({
      faculty: facultyId,
    })
      .populate("classId")
      .sort({ createdAt: -1 });

    const resources = resourcesDocs.map((r) => ({
      id: r._id.toString(),
      title: r.title,
      description: r.description || "",
      type: r.type,
      classId: r.classId ? r.classId._id.toString() : "",
      className: r.classId ? r.classId.name : "Deleted Class",
      date: new Date(r.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      size: r.fileSize || "1.2 MB",
      downloads: r.downloads || 0,
    }));

    return NextResponse.json({ success: true, resources, myClasses });
  } catch (error) {
    console.error("Fetch faculty resources error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resources" },
      { status: 500 },
    );
  }
}

// POST: Add/share a new resource
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, type, classId } = await req.json();

    if (!title || !classId) {
      return NextResponse.json(
        { error: "Title and Class ID are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Create the resource
    const newResource = await Resource.create({
      title,
      description,
      type: type || "notes",
      classId,
      faculty: session.user.id,
      fileName: title.toLowerCase().replace(/\s+/g, "_") + ".pdf",
      fileSize: "2.1 MB", // Simulated size
      fileUrl: "/mock/file.pdf",
    });

    return NextResponse.json({ success: true, resource: newResource });
  } catch (error) {
    console.error("Create resource error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to share resource" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a resource
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Resource ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const deleted = await Resource.findOneAndDelete({
      _id: id,
      faculty: session.user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Resource not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Resource deleted" });
  } catch (error) {
    console.error("Delete resource error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete resource" },
      { status: 500 },
    );
  }
}
