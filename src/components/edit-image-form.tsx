"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Image, Tag, Group } from "@prisma/client";

interface EditImageFormProps {
  image: Image & { tags: Tag[]; groups: Group[] };
}

interface GroupOption {
  id: string;
  name: string;
}

export function EditImageForm({ image }: EditImageFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(image.name);
  const [isPublic, setIsPublic] = useState(image.isPublic);
  const [allGroups, setAllGroups] = useState<GroupOption[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set(image.groups.map((g) => g.id))
  );
  const [editingGroups, setEditingGroups] = useState(false);

  useEffect(() => {
    fetch("/api/groups")
      .then((res) => res.json())
      .then((data) => setAllGroups(data.groups || []))
      .catch((err) => console.error("Error fetching groups:", err));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/images/${image.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          isPublic,
          groupIds: Array.from(selectedGroupIds),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Update failed");
        return;
      }

      setSuccess("Image updated successfully");
      router.refresh();
    } catch (err) {
      setError("An error occurred while updating");
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Edit Image
        </h1>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            ✗ {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-200">
            ✓ {success}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Image Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            maxLength={255}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-black placeholder-zinc-400 focus:border-black focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:border-white disabled:opacity-50"
            placeholder="Enter image name"
          />
        </div>

        {/* Public/Private */}
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-0 dark:bg-zinc-800 dark:border-zinc-600"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Make this image public
            </span>
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {isPublic ? "This image is visible to everyone" : "This image is only visible to you"}
          </p>
        </div>

        {/* Tags Info */}
        {image.tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {image.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-block bg-zinc-100 px-3 py-1 rounded text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Tag management coming soon
            </p>
          </div>
        )}

        {/* Groups Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Groups {image.groups.length > 0 && `(${image.groups.length})`}
            </label>
            <button
              type="button"
              onClick={() => setEditingGroups(!editingGroups)}
              disabled={loading}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {editingGroups ? "Done" : "Edit"}
            </button>
          </div>

          {!editingGroups && image.groups.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {image.groups.map((group) => (
                <span
                  key={group.id}
                  className="inline-block bg-zinc-100 px-3 py-1 rounded text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {group.name}
                </span>
              ))}
            </div>
          )}

          {editingGroups && (
            <div className="space-y-2">
              {allGroups.length > 0 ? (
                allGroups.map((group) => (
                  <label key={group.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.has(group.id)}
                      onChange={(e) => {
                        const newGroups = new Set(selectedGroupIds);
                        if (e.target.checked) {
                          newGroups.add(group.id);
                        } else {
                          newGroups.delete(group.id);
                        }
                        setSelectedGroupIds(newGroups);
                      }}
                      disabled={loading}
                      className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-0 dark:bg-zinc-800 dark:border-zinc-600"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {group.name}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No groups created yet
                </p>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {/* Delete Button */}
        <button
          type="button"
          className="w-full rounded-md border border-red-300 py-2 font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-200 dark:hover:bg-red-950"
        >
          Delete Image
        </button>
      </div>
    </form>
  );
}
