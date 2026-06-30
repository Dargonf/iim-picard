import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ImageViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const image = await prisma.image.findUnique({
    where: { id },
    include: {
      owner: {
        select: { username: true, uuid: true },
      },
      tags: true,
      groups: true,
    },
  });

  if (!image) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 text-center">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
              Image not found
            </h1>
            <Link
              href="/images"
              className="inline-block rounded-md bg-black px-6 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has permission to view this image
  const isOwner = session?.user?.uuid === image.ownerId;
  if (!image.isPublic && !isOwner) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 text-center">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
              Private Image
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              This image is private and you don&apos;t have permission to view it.
            </p>
            <Link
              href="/images"
              className="inline-block rounded-md bg-black px-6 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/images"
          className="mb-6 inline-block text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        >
          ← Back to Gallery
        </Link>

        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
          {/* Image Container */}
          <div className="bg-black flex items-center justify-center w-full" style={{ minHeight: "400px", maxHeight: "70vh" }}>
            <img
              src={`/uploads/${image.id}.${image.extension}`}
              alt={image.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Image Info */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                  {image.name}
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                  By{" "}
                  <span className="font-medium">
                    {image.owner.username}
                  </span>
                </p>
              </div>
              {isOwner && (
                <Link
                  href={`/images/${image.id}/edit`}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Edit
                </Link>
              )}
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  image.isPublic
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200"
                }`}
              >
                {image.isPublic ? "Public" : "Private"}
              </span>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-t border-zinc-200 dark:border-zinc-800">
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                  File Info
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {image.name}.{image.extension}
                </p>
              </div>

              {image.tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {image.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block bg-zinc-100 px-2 py-1 text-xs rounded text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {image.groups.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                    Groups
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {image.groups.map((group) => (
                      <span
                        key={group.id}
                        className="inline-block bg-zinc-100 px-2 py-1 text-xs rounded text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {group.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  Uploaded: {new Date(image.createdAt).toLocaleDateString()}
                </span>
                <span>
                  Last updated: {new Date(image.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
