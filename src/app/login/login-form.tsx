"use client";

import { FormEvent, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    // Show success message if user just registered
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created successfully! Please sign in.");
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Client-side validation
    if (!username || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (!result?.ok || result?.error) {
        setError("Invalid username or password");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError("An error occurred while signing in. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-200">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          ✗ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            disabled={loading}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black placeholder-zinc-400 focus:border-black focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:border-white disabled:opacity-50"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            disabled={loading}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black placeholder-zinc-400 focus:border-black focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:border-white disabled:opacity-50"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </>
  );
}
