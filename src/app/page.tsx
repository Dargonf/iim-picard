import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-black dark:text-white mb-6 leading-tight">
            Share Your Moments
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            Upload, organize, and share your favorite images with the world. Manage your gallery with tags, groups, and privacy controls.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/images"
              className="rounded-md bg-black px-8 py-3 text-lg font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
            >
              Browse Gallery
            </Link>
            {!session?.user && (
              <Link
                href="/register"
                className="rounded-md border-2 border-black px-8 py-3 text-lg font-medium text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              Easy Upload
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Upload images effortlessly and organize them with custom tags.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              Privacy Controls
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Choose who can see your images with public and private settings.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              Organize with Groups
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Group your images together and manage collections easily.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {session?.user ? (
          <div className="text-center py-16 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Welcome back, {session.user.username}!
            </h2>
            <Link
              href="/images/my-images"
              className="inline-block rounded-md bg-black px-8 py-3 text-lg font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
            >
              View Your Images
            </Link>
          </div>
        ) : (
          <div className="text-center py-16 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Ready to start sharing?
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
              Create an account to upload your first image.
            </p>
            <Link
              href="/register"
              className="inline-block rounded-md bg-black px-8 py-3 text-lg font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
