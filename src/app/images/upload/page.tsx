"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Group {
  id: string;
  name: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user) {
      fetch("/api/groups")
        .then((res) => res.json())
        .then((data) => setGroups(data.groups || []))
        .catch((err) => console.error("Error fetching groups:", err));
    }
  }, [session]);

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 text-center">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
              Sign in required
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              You need to be signed in to upload images.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-md bg-black px-6 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.currentTarget.files;
    if (!fileList) return;

    const newFiles = Array.from(fileList);
    const newPreviews = new Map(previews);
    setError(null);

    newFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          newPreviews.set(
            file.name,
            event.target?.result as string
          );
          setPreviews(new Map(newPreviews));
        };
        reader.readAsDataURL(file);
      }
    });

    setFiles([...files, ...newFiles]);
  }

  function removeFile(fileName: string) {
    setFiles(files.filter((f) => f.name !== fileName));
    const newPreviews = new Map(previews);
    newPreviews.delete(fileName);
    setPreviews(newPreviews);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const isPublic = formData.get("isPublic") === "on";

    if (files.length === 0) {
      setError("Please select at least one file");
      setLoading(false);
      return;
    }

    // Validate file sizes (max 100MB each)
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not an image file`);
        setLoading(false);
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        setError(`${file.name} is larger than 100MB`);
        setLoading(false);
        return;
      }
    }

    try {
      for (const file of files) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("isPublic", isPublic.toString());

        selectedGroups.forEach((groupId) => {
          uploadFormData.append("groupIds", groupId);
        });

        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const data = await response.json();

        if (!response.ok) {
          setError(`Failed to upload ${file.name}: ${data.error || "Unknown error"}`);
          setLoading(false);
          return;
        }
      }

      router.push("/images/my-images");
      router.refresh();
    } catch (err) {
      setError("An error occurred during upload");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="mb-6 text-2xl font-bold text-black dark:text-white">
            Upload Image
          </h1>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
              ✗ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Image Files
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="files"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={loading}
                  className="sr-only"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500 transition-colors disabled:opacity-50"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 text-zinc-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      PNG, JPG, GIF up to 100MB each
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* File Previews */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {files.map((file) => (
                  <div key={file.name} className="relative">
                    <div className="relative aspect-square rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 overflow-hidden">
                      {previews.get(file.name) && (
                        <img
                          src={previews.get(file.name)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      disabled={loading}
                      className="absolute top-1 right-1 rounded-full bg-red-500 text-white p-1 hover:bg-red-600 disabled:opacity-50"
                    >
                      ✕
                    </button>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Group Selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Add to Groups (Optional)
              </label>
              <div className="space-y-2">
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <label key={group.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedGroups.has(group.id)}
                        onChange={(e) => {
                          const newGroups = new Set(selectedGroups);
                          if (e.target.checked) {
                            newGroups.add(group.id);
                          } else {
                            newGroups.delete(group.id);
                          }
                          setSelectedGroups(newGroups);
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
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                disabled={loading}
                className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-0 dark:bg-zinc-800 dark:border-zinc-600"
              />
              <label
                htmlFor="isPublic"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Make these images public
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || files.length === 0}
              className="w-full rounded-md bg-black py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? "Uploading..." : `Upload ${files.length} Image${files.length !== 1 ? "s" : ""}`}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/images/my-images"
              className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              Back to My Images
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
