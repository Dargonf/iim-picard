import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function PublicImages() {
  const images = await prisma.image.findMany({
    where: { isPublic: true },
    include: {
      owner: {
        select: { username: true },
      },
      tags: {
        select: { name: true },
      },
      groups: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">No public images yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => (
        <Link key={image.id} href={`/images/${image.id}`}>
          <div
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer hover:shadow-md dark:hover:shadow-lg transition-shadow"
          >
            <div className="mb-4 aspect-square overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <img
                src={`/uploads/${image.id}.${image.extension}`}
                alt={image.name}
                className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>

            <h3 className="font-semibold text-black dark:text-white mb-2">
              {image.name}
            </h3>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            By {image.owner.username}
          </p>

          {image.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {image.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="inline-block bg-zinc-100 px-2 py-1 text-xs rounded text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

            {image.groups.length > 0 && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Groups: {image.groups.map((g) => g.name).join(", ")}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function ImagesPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Public Images
          </h1>
          {session?.user ? (
            <div className="flex gap-3">
              <Link
                href="/images/upload"
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Upload
              </Link>
              <Link
                href="/images/my-images"
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-900"
              >
                My Images
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Sign In to Upload
            </Link>
          )}
        </div>

        <Suspense fallback={<div>Loading images...</div>}>
          <PublicImages />
        </Suspense>
      </div>
    </div>
  );
}
