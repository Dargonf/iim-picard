import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditImageForm } from "@/components/edit-image-form";

export default async function EditImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.uuid) {
    redirect("/login");
  }

  const image = await prisma.image.findUnique({
    where: { id },
    include: {
      tags: true,
      groups: true,
    },
  });

  if (!image) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 text-center">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
              Image not found
            </h1>
            <Link
              href="/images/my-images"
              className="inline-block rounded-md bg-black px-6 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Back to My Images
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (image.ownerId !== session.user.uuid) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 text-center">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
              Not authorized
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              You don&apos;t have permission to edit this image.
            </p>
            <Link
              href="/images/my-images"
              className="inline-block rounded-md bg-black px-6 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Back to My Images
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/images/my-images"
          className="mb-6 inline-block text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        >
          ← Back to My Images
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Preview */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sticky top-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <img
                  src={`/uploads/${image.id}.${image.extension}`}
                  alt={image.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 break-words">
                {image.name}.{image.extension}
              </p>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <EditImageForm image={image} />
          </div>
        </div>
      </div>
    </div>
  );
}
