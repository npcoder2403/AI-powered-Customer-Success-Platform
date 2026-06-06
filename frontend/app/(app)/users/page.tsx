"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/src/store/store";
import { userService } from "@/src/services/userService";
import { User } from "@/src/types";
import { getErrorMessage } from "@/src/utils/getErrorMessage";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";
import PageHeader from "@/src/components/ui/PageHeader";
import Badge from "@/src/components/ui/Badge";
import Dialog from "@/src/components/ui/Dialog";
import { Table, TableRow, TableCell } from "@/src/components/ui/Table";
import { ShieldCheck, ShieldOff, Mail, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleChange, setRoleChange] = useState<{ userId: number; newRole: string; userName: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    userService.list()
      .then(setUsers)
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, [currentUser, router]);

  const confirmRoleChange = async () => {
    if (!roleChange) return;
    setSaving(true);
    try {
      const updated = await userService.updateRole(roleChange.userId, roleChange.newRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(`${roleChange.userName} is now ${roleChange.newRole}`);
      setRoleChange(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update role"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="User Management"
        description={`${users.length} registered users`}
      />

      <Table headers={["Name", "Email", "Role", "Joined", "Actions"]}>
        {users.map((u) => {
          const isSelf = u.id === currentUser?.id;
          const isAdmin = u.role === "admin";
          return (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {u.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-800">{u.full_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {u.email}
                </div>
              </TableCell>
              <TableCell><Badge>{u.role}</Badge></TableCell>
              <TableCell className="text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(u.created_at).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                {isSelf ? (
                  <span className="text-xs text-slate-400">You</span>
                ) : (
                  <button
                    onClick={() =>
                      setRoleChange({
                        userId: u.id,
                        newRole: isAdmin ? "user" : "admin",
                        userName: u.full_name,
                      })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isAdmin
                        ? "text-red-600 bg-red-50 hover:bg-red-100"
                        : "text-blue-600 bg-blue-50 hover:bg-blue-100"
                    }`}
                  >
                    {isAdmin ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    {isAdmin ? "Remove Admin" : "Make Admin"}
                  </button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </Table>

      <Dialog
        open={roleChange !== null}
        onClose={() => setRoleChange(null)}
        onConfirm={confirmRoleChange}
        title={roleChange?.newRole === "admin" ? "Promote to Admin" : "Remove Admin Access"}
        description={
          roleChange?.newRole === "admin"
            ? `${roleChange?.userName} will be able to manage all customers, users, and resources.`
            : `${roleChange?.userName} will only be able to manage their own interactions.`
        }
        confirmLabel={roleChange?.newRole === "admin" ? "Make Admin" : "Remove Admin"}
        variant={roleChange?.newRole === "admin" ? "info" : "warning"}
        loading={saving}
      />
    </div>
  );
}
