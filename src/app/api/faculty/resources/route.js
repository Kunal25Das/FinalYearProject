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

    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description") || "";
    const type = formData.get("type") || "notes";
    const classId = formData.get("classId");
    const file = formData.get("file");

    if (!title || !classId) {
      return NextResponse.json(
        { error: "Title and Class ID are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    let fileUrl = "/mock/file.pdf";
    let fileSize = "1.2 MB";
    const fileName = file
      ? file.name
      : title.toLowerCase().replace(/\s+/g, "_") + ".pdf";

    if (file) {
      // Upload to Appwrite Storage server-side!
      const endpoint =
        process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
        "https://fra.cloud.appwrite.io/v1";
      const bucketId = (
        process.env.APPWRITE_BUCKET_ID || "6a4cb689003165e24143"
      ).replace(/^"|"$/g, "");
      const projectId = (
        process.env.APPWRITE_PROJECT_ID || "6a4cb5500038fd245209"
      ).replace(/^"|"$/g, "");
      const apiKey = (process.env.APPWRITE_API_KEY || "").replace(/^"|"$/g, "");

      const appwriteFormData = new FormData();
      appwriteFormData.append("fileId", "unique()");
      appwriteFormData.append("file", file);

      const appwriteRes = await fetch(
        `${endpoint}/storage/buckets/${bucketId}/files`,
        {
          method: "POST",
          headers: {
            "X-Appwrite-Project": projectId,
            "X-Appwrite-Key": apiKey,
          },
          body: appwriteFormData,
        },
      );

      if (!appwriteRes.ok) {
        const errText = await appwriteRes.text();
        console.error("Appwrite upload error:", errText);
        throw new Error("Failed to upload file to Appwrite storage bucket");
      }

      const responseData = await appwriteRes.json();
      const fileId = responseData.$id;
      fileUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;

      const sizeInBytes = responseData.sizeOriginal || file.size;
      if (sizeInBytes >= 1048576) {
        fileSize = `${(sizeInBytes / 1048576).toFixed(1)} MB`;
      } else {
        fileSize = `${(sizeInBytes / 1024).toFixed(0)} KB`;
      }
    }

    // Create the resource
    const newResource = await Resource.create({
      title,
      description,
      type,
      classId,
      faculty: session.user.id,
      fileName,
      fileSize,
      fileUrl,
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
