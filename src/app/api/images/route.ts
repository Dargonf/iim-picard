import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.uuid) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const images = await prisma.image.findMany({
      where: { ownerId: session.user.uuid },
      select: {
        id: true,
        name: true,
        extension: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(
      {
        images: images.map((img) => ({
          id: img.id,
          name: img.name,
          extension: img.extension,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get images error:", error);
    return Response.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
