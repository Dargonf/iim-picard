import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateImageSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  isPublic: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.uuid) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, isPublic } = updateImageSchema.parse(body);

    // Check if image exists and user owns it
    const image = await prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      return Response.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    if (image.ownerId !== session.user.uuid) {
      return Response.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    // Update image
    const updatedImage = await prisma.image.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return Response.json(
      {
        message: "Image updated successfully",
        image: {
          id: updatedImage.id,
          name: updatedImage.name,
          isPublic: updatedImage.isPublic,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Update error:", error);
    return Response.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.uuid) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if image exists and user owns it
    const image = await prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      return Response.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    if (image.ownerId !== session.user.uuid) {
      return Response.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    // Delete from database and file
    await prisma.image.delete({
      where: { id },
    });

    return Response.json(
      { message: "Image deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return Response.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
