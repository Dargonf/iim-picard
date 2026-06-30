"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CreateGroupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (!name.trim()) {
      setError("Group name is required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create group");
        return;
      }

      e.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setError("An error occurred while creating the group");
      console.error("Create group error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            ✗ {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              disabled={loading}
              maxLength={255}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-black placeholder-zinc-400 focus:border-black focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:border-white disabled:opacity-50"
              placeholder="e.g., Vacation, Nature, Family"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </form>
  );
}
