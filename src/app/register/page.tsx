"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="mb-6 text-2xl font-bold text-black dark:text-white">
            Create Account
          </h1>

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
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                disabled={loading}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black placeholder-zinc-400 focus:border-black focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:border-white disabled:opacity-50"
                placeholder="Enter your email"
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
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                disabled={loading}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black placeholder-zinc-400 focus:border-black focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:border-white disabled:opacity-50"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-black py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-black hover:underline dark:text-white">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
