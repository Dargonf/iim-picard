"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Group, Image } from "@prisma/client";

interface ManageGroupImagesProps {
  group: Group & { images: Array<Pick<Image, "id" | "name" | "extension">> };
}

export function ManageGroupImages({
  group,
}: ManageGroupImagesProps) {
  const router = useRouter();
  const [allImages, setAllImages] = useState<Array<{ id: string; name: string; extension: string }>>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(
    new Set(group.images.map((img) => img.id))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch("/api/images");
        if (response.ok) {
          const data = await response.json();
          setAllImages(data.images || []);
        }
      } catch (err) {
        console.error("Error fetching images:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  function toggleImage(imageId: string) {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  }

  async function handleSave() {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/groups/${group.id}/images`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageIds: Array.from(selectedImages),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update group images");
        return;
      }

      router.refresh();
    } catch (err) {
      setError("An error occurred while updating the group");
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading images...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          ✗ {error}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Add Images to Group
          </h2>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isEditing ? "Done" : "Edit Group"}
          </button>
        </div>

        {isEditing && (
          <>
            {allImages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  No images available. Upload some images first.
                </p>
                <Link
                  href="/images/upload"
                  className="inline-block rounded-md bg-black px-6 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Upload Image
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-6">
                  {allImages.map((image) => (
                    <label
                      key={image.id}
                      className="cursor-pointer"
                    >
                      <div className="relative">
                        <div className="aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                          <img
                            src={`/uploads/${image.id}.${image.extension}`}
                            alt={image.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedImages.has(image.id)}
                          onChange={() => toggleImage(image.id)}
                          className="absolute top-2 left-2 w-4 h-4 rounded border-zinc-300"
                        />
                        {selectedImages.has(image.id) && (
                          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-xs mt-2 text-zinc-600 dark:text-zinc-400 truncate">
                        {image.name}
                      </p>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full rounded-md bg-black py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  {loading ? "Saving..." : `Save (${selectedImages.size} selected)`}
                </button>
              </>
            )}
          </>
        )}
      </div>

      {group.images.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
            Images in this Group
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {group.images.map((image) => (
              <Link
                key={image.id}
                href={`/images/${image.id}`}
                className="cursor-pointer"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 hover:shadow-md dark:hover:shadow-lg transition-shadow">
                  <img
                    src={`/uploads/${image.id}.${image.extension}`}
                    alt={image.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs mt-2 text-zinc-600 dark:text-zinc-400 truncate">
                  {image.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
