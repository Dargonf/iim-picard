"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Group, Image } from "@/lib/prisma/client";

interface GroupsListProps {
  groups: Array<Group & { images: Array<Pick<Image, "id" | "name" | "extension">>; _count: { images: number } }>;
}

export function GroupsList({ groups }: GroupsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this group?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Failed to delete group");
        return;
      }

      router.refresh();
    } catch (err) {
      alert("An error occurred while deleting the group");
      console.error("Delete group error:", err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <Link key={group.id} href={`/groups/${group.id}`}>
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer hover:shadow-md dark:hover:shadow-lg transition-shadow h-full overflow-hidden flex flex-col">
            {/* Image Preview Grid */}
            {group.images.length > 0 ? (
              <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 grid grid-cols-2 gap-0 overflow-hidden">
                {group.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative w-full h-full bg-zinc-200 dark:bg-zinc-700"
                  >
                    <img
                      src={`/uploads/${image.id}.${image.extension}`}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {/* Fill remaining grid spots if less than 4 images */}
                {group.images.length < 4 &&
                  Array(4 - group.images.length)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="w-full h-full bg-zinc-100 dark:bg-zinc-800"
                      />
                    ))}
              </div>
            ) : (
              <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No images
                </p>
              </div>
            )}

            {/* Group Info */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-black dark:text-white mb-1 text-lg">
                {group.name}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 flex-1">
                {group._count.images} image{group._count.images !== 1 ? "s" : ""}
              </p>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(group.id);
                }}
                disabled={deletingId === group.id}
                className="w-full rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900 disabled:opacity-50"
              >
                {deletingId === group.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
