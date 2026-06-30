import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateGroupImagesSchema = z.object({
  imageIds: z.array(z.string()),
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
    const { imageIds } = updateGroupImagesSchema.parse(body);

    // Check if group exists and user owns it
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return Response.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    if (group.ownerId !== session.user.uuid) {
      return Response.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    // Verify all images belong to the user
    const images = await prisma.image.findMany({
      where: {
        id: { in: imageIds },
        ownerId: session.user.uuid,
      },
    });

    if (images.length !== imageIds.length) {
      return Response.json(
        { error: "Some images not found or you don't own them" },
        { status: 400 }
      );
    }

    // Clear existing images and add new ones
    await prisma.group.update({
      where: { id },
      data: {
        images: {
          disconnect: await prisma.image.findMany({
            where: { groups: { some: { id } } },
            select: { id: true },
          }),
          connect: imageIds.map((id) => ({ id })),
        },
      },
    });

    return Response.json(
      {
        message: "Group images updated successfully",
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

    console.error("Update group images error:", error);
    return Response.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
