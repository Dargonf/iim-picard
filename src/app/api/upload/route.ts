import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.uuid) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const isPublic = formData.get("isPublic") === "true";

    if (!file) {
      return Response.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return Response.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Get file extension
    const originalName = file.name;
    const fileExtension = originalName.split(".").pop()?.toLowerCase() || "jpg";

    // Remove extension from name for storage
    const nameWithoutExtension = originalName
      .split(".")
      .slice(0, -1)
      .join(".");

    // Generate UUID for file
    const fileId = randomUUID();
    const fileName = `${fileId}.${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Write file
    const filePath = join(uploadsDir, fileName);
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    // Create database record
    const image = await prisma.image.create({
      data: {
        id: fileId,
        name: nameWithoutExtension || "Untitled",
        extension: fileExtension,
        isPublic,
        ownerId: session.user.uuid,
      },
    });

    return Response.json(
      {
        message: "Image uploaded successfully",
        image: {
          id: image.id,
          name: image.name,
          extension: image.extension,
          isPublic: image.isPublic,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: "An error occurred during upload" },
      { status: 500 }
    );
  }
}
