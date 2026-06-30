"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

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
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    const isPublic = formData.get("isPublic") === "on";

    if (!file) {
      setError("Please select a file");
      setLoading(false);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      setLoading(false);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setLoading(false);
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("isPublic", isPublic.toString());

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Upload failed");
        return;
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
                Image File
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={loading}
                  className="sr-only"
                  id="file-input"
                  required
                />
                <label
                  htmlFor="file-input"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500 transition-colors disabled:opacity-50"
                >
                  {preview ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-28 max-w-28 object-contain"
                      />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                        {fileName}
                      </p>
                    </div>
                  ) : (
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
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </label>
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
                Make this image public
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !preview}
              className="w-full rounded-md bg-black py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? "Uploading..." : "Upload Image"}
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
