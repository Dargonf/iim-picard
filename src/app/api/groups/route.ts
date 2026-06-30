import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1).max(255),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.uuid) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = createGroupSchema.parse(body);

    // Check if group with same name already exists for this user
    const existingGroup = await prisma.group.findFirst({
      where: {
        name,
        ownerId: session.user.uuid,
      },
    });

    if (existingGroup) {
      return Response.json(
        { error: "Group with this name already exists" },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name,
        ownerId: session.user.uuid,
      },
    });

    return Response.json(
      {
        message: "Group created successfully",
        group: {
          id: group.id,
          name: group.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Group creation error:", error);
    return Response.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.uuid) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const groups = await prisma.group.findMany({
      where: { ownerId: session.user.uuid },
      include: {
        _count: {
          select: { images: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(
      {
        groups: groups.map((g) => ({
          id: g.id,
          name: g.name,
          imageCount: g._count.images,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get groups error:", error);
    return Response.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
