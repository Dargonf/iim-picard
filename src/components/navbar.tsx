"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    signOut({ callbackUrl: "/" });
  }

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-black dark:text-white hover:text-zinc-600 dark:hover:text-zinc-400"
          >
            Gallery
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/images"
              className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Browse
            </Link>

            {session?.user ? (
              <>
                <Link
                  href="/images/my-images"
                  className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  My Images
                </Link>
                <Link
                  href="/groups"
                  className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  Groups
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {session.user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-black dark:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <Link
              href="/images"
              className="block text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              Browse
            </Link>

            {session?.user ? (
              <>
                <Link
                  href="/images/my-images"
                  className="block text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                >
                  My Images
                </Link>
                <Link
                  href="/groups"
                  className="block text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                >
                  Groups
                </Link>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    {session.user.username}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
