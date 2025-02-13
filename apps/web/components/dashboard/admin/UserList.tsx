"use client";

import { ActionButton } from "@/components/ui/action-button";
import LoadingSpinner from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/trpc";
import { Trash } from "lucide-react";
import { useSession } from "next-auth/react";

function toHumanReadableSize(size: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (size === 0) return "0 Bytes";
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

export default function UsersSection() {
  const { data: session } = useSession();
  const invalidateUserList = api.useUtils().users.list.invalidate;
  const { data: users } = api.users.list.useQuery();
  const { data: userStats } = api.admin.userStats.useQuery();
  const { mutate: deleteUser, isPending: isDeletionPending } =
    api.users.delete.useMutation({
      onSuccess: () => {
        toast({
          description: "User deleted",
        });
        invalidateUserList();
      },
      onError: (e) => {
        toast({
          variant: "destructive",
          description: `Something went wrong: ${e.message}`,
        });
      },
    });

  if (!users || !userStats) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="mb-2 text-xl font-medium">Users List</div>

      <Table>
        <TableHeader className="bg-gray-200">
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Num Bookmarks</TableHead>
          <TableHead>Asset Sizes</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Action</TableHead>
        </TableHeader>
        <TableBody>
          {users.users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="py-1">{u.name}</TableCell>
              <TableCell className="py-1">{u.email}</TableCell>
              <TableCell className="py-1">
                {userStats[u.id].numBookmarks}
              </TableCell>
              <TableCell className="py-1">
                {toHumanReadableSize(userStats[u.id].assetSizes)}
              </TableCell>
              <TableCell className="py-1 capitalize">{u.role}</TableCell>
              <TableCell className="py-1">
                <ActionButton
                  variant="outline"
                  onClick={() => deleteUser({ userId: u.id })}
                  loading={isDeletionPending}
                  disabled={session!.user.id == u.id}
                >
                  <Trash size={16} color="red" />
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
