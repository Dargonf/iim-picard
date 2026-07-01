import Link from "next/link";
import type { Group, Image } from "@/lib/prisma/client";

interface GroupOverviewProps {
  group: Group & { images: Array<Pick<Image, "id" | "name" | "extension">> };
}

export function GroupOverview({ group }: GroupOverviewProps) {
  if (group.images.length === 0) {
    return (
      <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 text-center">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          No images in this group yet.
        </p>
        <Link
          href="/images/upload"
          className="inline-block rounded-md bg-black px-6 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Upload Images
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
        Overview
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {group.images.map((image) => (
          <Link
            key={image.id}
            href={`/images/${image.id}`}
            className="group cursor-pointer"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
              <img
                src={`/uploads/${image.id}.${image.extension}`}
                alt={image.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
            <p className="text-xs mt-2 text-zinc-600 dark:text-zinc-400 truncate">
              {image.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
