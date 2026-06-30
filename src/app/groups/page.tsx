import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateGroupForm } from "@/components/create-group-form";
import { GroupsList } from "@/components/groups-list";

async function GroupsContent() {
  const session = await auth();

  if (!session?.user?.uuid) {
    redirect("/login");
  }

  const groups = await prisma.group.findMany({
    where: { ownerId: session.user.uuid },
    include: {
      _count: {
        select: { images: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
          Create New Group
        </h2>
        <CreateGroupForm />
      </div>

      {groups.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
            Your Groups ({groups.length})
          </h2>
          <GroupsList groups={groups} />
        </div>
      )}

      {groups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            You haven&apos;t created any groups yet.
          </p>
        </div>
      )}
    </div>
  );
}

export default async function GroupsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Groups
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Organize your images into groups for better management
          </p>
        </div>

        <Suspense fallback={<div>Loading groups...</div>}>
          <GroupsContent />
        </Suspense>
      </div>
    </div>
  );
}
