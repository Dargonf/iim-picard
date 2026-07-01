"use client";

import { useRouter } from "next/navigation";

export function DeleteImageButton({ imageId }: { imageId: string }) {
  const router = useRouter();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to delete this image?")) {
          fetch(`/api/images/${imageId}`, { method: "DELETE" }).then(() => {
            router.refresh();
          });
        }
      }}
      className="flex-1 rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900"
    >
      Delete
    </button>
  );
}
