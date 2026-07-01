import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeleteImageButton } from "./delete-button";

async function UserImages() {
  const session = await auth();

  if (!session?.user?.uuid) {
    redirect("/login");
  }

  const images = await prisma.image.findMany({
    where: { ownerId: session.user.uuid },
    include: {
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
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          You haven&apos;t uploaded any images yet.
        </p>
        <Link
          href="/images/upload"
          className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Upload Image
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => (
        <div key={image.id}>
          <Link href={`/images/${image.id}`}>
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

          <div className="mb-3 flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                image.isPublic
                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200"
                  : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200"
              }`}
            >
              {image.isPublic ? "Public" : "Private"}
            </span>
          </div>

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
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Groups: {image.groups.map((g) => g.name).join(", ")}
              </div>
            )}
          </div>
          </Link>

          <div className="flex gap-2 mt-2">
            <Link
              href={`/images/${image.id}/edit`}
              className="flex-1 text-center rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900"
            >
              Edit
            </Link>
            <DeleteImageButton imageId={image.id} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function MyImagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            My Images
          </h1>
          <div className="flex gap-3">
            <Link
              href="/images/upload"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Upload Image
            </Link>
            <Link
              href="/images"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-900"
            >
              Browse All
            </Link>
          </div>
        </div>

        <Suspense fallback={<div>Loading images...</div>}>
          <UserImages />
        </Suspense>
      </div>
    </div>
  );
}
