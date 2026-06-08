"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchCustomers } from "@/src/store/customerSlice";
import { AppDispatch, RootState } from "@/src/store/store";
import Link from "next/link";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";
import EmptyState from "@/src/components/shared/EmptyState";
import Pagination from "@/src/components/ui/Pagination";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Select from "@/src/components/ui/Select";
import PageHeader from "@/src/components/ui/PageHeader";
import { Table, TableRow, TableCell } from "@/src/components/ui/Table";
import { Plus, Search, Eye, Pencil, Trash2, Users } from "lucide-react";
import { customerService } from "@/src/services/customerService";
import { useDebounce } from "@/src/hooks/useDebounce";
import Dialog from "@/src/components/ui/Dialog";
import toast from "react-hot-toast";

const industryOptions = [
  { value: "Technology", label: "Technology" }, { value: "Healthcare", label: "Healthcare" },
  { value: "Finance", label: "Finance" }, { value: "Education", label: "Education" },
  { value: "Retail", label: "Retail" }, { value: "Manufacturing", label: "Manufacturing" },
];

const statusOptions = [
  { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" },
  { value: "lead", label: "Lead" }, { value: "churned", label: "Churned" },
];

export default function CustomersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { items, loading, totalPages, total } = useSelector((state: RootState) => state.customers);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, isAdmin, router]);

  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const params: Record<string, string | number> = { page: currentPage, page_size: 10 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (industry) params.industry = industry;
    if (status) params.status = status;
    dispatch(fetchCustomers(params));
  }, [dispatch, currentPage, debouncedSearch, industry, status]);

  const refetch = useCallback(() => {
    const params: Record<string, string | number> = { page: currentPage, page_size: 10 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (industry) params.industry = industry;
    if (status) params.status = status;
    dispatch(fetchCustomers(params));
  }, [dispatch, currentPage, debouncedSearch, industry, status]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget);
    try {
      await customerService.delete(deleteTarget);
      toast.success("Customer deleted");
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error("Failed to delete customer");
    } finally {
      setDeleting(null);
    }
  }, [deleteTarget, refetch]);

  return (
    <div>
      <PageHeader
        title="Customers"
        description={total > 0 ? `${total} customers total` : "Manage your customer relationships"}
        actions={
          isAdmin ? (
            <Link href="/customers/create">
              <Button icon={Plus}>Add Customer</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search by company name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select options={industryOptions} placeholder="All Industries" value={industry} onChange={(e) => { setIndustry(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="w-full sm:w-40">
            <Select options={statusOptions} placeholder="All Statuses" value={status} onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          title={debouncedSearch || industry || status ? "No matching customers" : "No customers yet"}
          message={debouncedSearch || industry || status ? "Try adjusting your search or filters." : "Add your first customer to start tracking relationships."}
          icon={<Users className="w-8 h-8 text-slate-400" />}
          action={isAdmin && !debouncedSearch && !industry && !status ? <Link href="/customers/create"><Button icon={Plus} size="sm">Add Customer</Button></Link> : undefined}
        />
      ) : (
        <div>
          <Table headers={isAdmin ? ["Company", "Contact", "Email", "Industry", "Status", "Actions"] : ["Company", "Contact", "Email", "Industry", "Status"]}>
            {items.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold text-slate-800">{c.company_name}</TableCell>
                <TableCell className="text-slate-600">{c.contact_name}</TableCell>
                <TableCell className="text-slate-500">{c.email}</TableCell>
                <TableCell className="text-slate-500">{c.industry || "--"}</TableCell>
                <TableCell><Badge>{c.status}</Badge></TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/customers/${c.id}`} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></Link>
                      <Link href={`/customers/${c.id}/edit`} className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"><Pencil className="w-4 h-4" /></Link>
                      <button
                        onClick={() => setDeleteTarget(c.id)}
                        disabled={deleting === c.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className={`w-4 h-4 ${deleting === c.id ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </Table>
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        description="This action cannot be undone. All interactions associated with this customer will also be permanently deleted."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting !== null}
      />
    </div>
  );
}
