"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomer } from "@/src/store/customerSlice";
import { AppDispatch, RootState } from "@/src/store/store";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import PageHeader from "@/src/components/ui/PageHeader";
import Link from "next/link";
import { Pencil, Mail, Phone, Building, Calendar, Globe, MessageSquare } from "lucide-react";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { current: customer, loading } = useSelector((state: RootState) => state.customers);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/interactions");
    }
  }, [user, isAdmin, router]);

  useEffect(() => { if (id) dispatch(fetchCustomer(Number(id))); }, [dispatch, id]);

  if (loading) return <LoadingSpinner />;
  if (!customer) return <div className="text-center py-12 text-slate-500">Customer not found</div>;

  const details = [
    { icon: Building, label: "Company", value: customer.company_name },
    { icon: Mail, label: "Email", value: customer.email },
    { icon: Phone, label: "Phone", value: customer.phone || "Not provided" },
    { icon: Globe, label: "Industry", value: customer.industry || "Not specified" },
    { icon: Calendar, label: "Created", value: new Date(customer.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={customer.company_name}
        description={`Contact: ${customer.contact_name}`}
        backHref="/customers"
        backLabel="Back to Customers"
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/interactions?customer_id=${customer.id}`}>
              <Button variant="outline" icon={MessageSquare} size="sm">View Interactions</Button>
            </Link>
            {isAdmin && (
              <Link href={`/customers/${customer.id}/edit`}>
                <Button icon={Pencil} size="sm">Edit</Button>
              </Link>
            )}
          </div>
        }
      />

      <Card>
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
            {customer.company_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{customer.company_name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-slate-500">{customer.contact_name}</span>
              <Badge>{customer.status}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {details.map((item) => (
            <div key={item.label} className="flex items-start gap-3.5">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className="w-[18px] h-[18px] text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
