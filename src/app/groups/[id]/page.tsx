import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ManageGroupImages } from "@/components/manage-group-images";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.uuid) {
    redirect("/login");
  }

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      images: {
        select: {
          id: true,
          name: true,
          extension: true,
        },
      },
    },
  });

  if (!group) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 text-center">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
              Group not found
            </h1>
            <Link
              href="/groups"
              className="inline-block rounded-md bg-black px-6 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Back to Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (group.ownerId !== session.user.uuid) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 text-center">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
              Not authorized
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              You don&apos;t have permission to manage this group.
            </p>
            <Link
              href="/groups"
              className="inline-block rounded-md bg-black px-6 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Back to Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/groups"
          className="mb-6 inline-block text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        >
          ← Back to Groups
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            {group.name}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {group.images.length} image{group.images.length !== 1 ? "s" : ""}
          </p>
        </div>

        <ManageGroupImages group={group} userId={session.user.uuid} />
      </div>
    </div>
  );
}
