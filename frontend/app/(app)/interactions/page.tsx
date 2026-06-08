"use client";

import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { fetchInteractions } from "@/src/store/interactionSlice";
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
import { Plus, Eye, Pencil, MessageSquare } from "lucide-react";
import { useDebounce } from "@/src/hooks/useDebounce";

const typeOptions = [
  { value: "meeting", label: "Meeting" }, { value: "call", label: "Call" },
  { value: "email", label: "Email" }, { value: "demo", label: "Demo" },
  { value: "support", label: "Support" },
];

function InteractionsContent() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const { items, loading, totalPages } = useSelector((state: RootState) => state.interactions);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const [currentPage, setCurrentPage] = useState(1);
  const [interactionType, setInteractionType] = useState("");
  const [customerId, setCustomerId] = useState(searchParams.get("customer_id") || "");

  const debouncedCustomerId = useDebounce(customerId, 400);

  useEffect(() => {
    const params: Record<string, string | number> = { page: currentPage, page_size: 10 };
    if (debouncedCustomerId) params.customer_id = Number(debouncedCustomerId);
    if (interactionType) params.interaction_type = interactionType;
    dispatch(fetchInteractions(params));
  }, [dispatch, currentPage, debouncedCustomerId, interactionType]);

  return (
    <div>
      <PageHeader
        title="Interactions"
        description="Track meetings, calls, and communications with customers"
        actions={isAdmin ? <Link href="/interactions/create"><Button icon={Plus}>New Interaction</Button></Link> : undefined}
      />

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-40">
            <Input
              type="number"
              placeholder="Customer ID"
              value={customerId}
              onChange={(e) => { setCustomerId(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select options={typeOptions} placeholder="All Types" value={interactionType} onChange={(e) => { setInteractionType(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          title={debouncedCustomerId || interactionType ? "No matching interactions" : "No interactions yet"}
          message={debouncedCustomerId || interactionType ? "Try adjusting your filters." : "Record your first customer interaction to get started."}
          icon={<MessageSquare className="w-8 h-8 text-slate-400" />}
          action={isAdmin && !debouncedCustomerId && !interactionType ? <Link href="/interactions/create"><Button icon={Plus} size="sm">New Interaction</Button></Link> : undefined}
        />
      ) : (
        <div>
          <Table headers={isAdmin ? ["Title", "Customer", "Type", "Date", "Sentiment", "Actions"] : ["Title", "Customer", "Type", "Date", "Sentiment"]}>
            {items.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-semibold text-slate-800">{i.title}</TableCell>
                <TableCell className="text-slate-600">{i.customer_name || `#${i.customer_id}`}</TableCell>
                <TableCell><Badge>{i.interaction_type}</Badge></TableCell>
                <TableCell className="text-slate-500">{new Date(i.meeting_date).toLocaleDateString()}</TableCell>
                <TableCell>{i.ai_insight ? <Badge>{i.ai_insight.sentiment}</Badge> : <span className="text-xs text-slate-400">--</span>}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/interactions/${i.id}`} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></Link>
                      <Link href={`/interactions/${i.id}/edit`} className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"><Pencil className="w-4 h-4" /></Link>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </Table>
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}

export default function InteractionsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <InteractionsContent />
    </Suspense>
  );
}
