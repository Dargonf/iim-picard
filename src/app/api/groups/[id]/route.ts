import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateGroupSchema = z.object({
  name: z.string().min(1).max(255).optional(),
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
    const { name } = updateGroupSchema.parse(body);

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

    if (name) {
      // Check if new name already exists
      const existingGroup = await prisma.group.findFirst({
        where: {
          name,
          ownerId: session.user.uuid,
          NOT: { id },
        },
      });

      if (existingGroup) {
        return Response.json(
          { error: "Group with this name already exists" },
          { status: 400 }
        );
      }
    }

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: {
        ...(name && { name }),
      },
    });

    return Response.json(
      {
        message: "Group updated successfully",
        group: {
          id: updatedGroup.id,
          name: updatedGroup.name,
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

    console.error("Update group error:", error);
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

    await prisma.group.delete({
      where: { id },
    });

    return Response.json(
      { message: "Group deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete group error:", error);
    return Response.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
