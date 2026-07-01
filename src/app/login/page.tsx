import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="mb-6 text-2xl font-bold text-black dark:text-white">
            Sign In
          </h1>
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
          <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <a href="/register" className="font-medium text-black hover:underline dark:text-white">
              Register here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
