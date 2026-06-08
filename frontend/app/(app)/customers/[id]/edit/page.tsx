"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { Formik, Form } from "formik";
import { customerService } from "@/src/services/customerService";
import { getErrorMessage } from "@/src/utils/getErrorMessage";
import toast from "react-hot-toast";
import FormField from "@/src/components/ui/FormField";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import PageHeader from "@/src/components/ui/PageHeader";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";
import { Save } from "lucide-react";
import Link from "next/link";
import { customerSchema } from "@/src/utils/validationSchemas";

const industryOptions = [
  { value: "Technology", label: "Technology" }, { value: "Healthcare", label: "Healthcare" },
  { value: "Finance", label: "Finance" }, { value: "Education", label: "Education" },
  { value: "Retail", label: "Retail" }, { value: "Manufacturing", label: "Manufacturing" },
];

const statusOptions = [
  { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" },
  { value: "lead", label: "Lead" }, { value: "churned", label: "Churned" },
];

export default function EditCustomerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialValues, setInitialValues] = useState({ company_name: "", contact_name: "", email: "", phone: "", industry: "", status: "active" });

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "superadmin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (id) {
      customerService.get(Number(id)).then((data) => {
        setInitialValues({ company_name: data.company_name, contact_name: data.contact_name, email: data.email, phone: data.phone || "", industry: data.industry || "", status: data.status });
        setPageLoading(false);
      }).catch(() => { toast.error("Failed to load customer"); setPageLoading(false); });
    }
  }, [id]);

  if (pageLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Edit Customer" description="Update customer information" backHref={`/customers/${id}`} backLabel="Back to Customer" />
      <Card>
        <Formik
          initialValues={initialValues}
          validationSchema={customerSchema}
          enableReinitialize
          onSubmit={async (values) => {
            setSaving(true);
            try {
              await customerService.update(Number(id), values);
              toast.success("Customer updated successfully");
              router.push(`/customers/${id}`);
            } catch (err: unknown) {
              toast.error(getErrorMessage(err, "Failed to update customer"));
            } finally { setSaving(false); }
          }}
        >
          <Form className="space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField name="company_name" type="text" label="Company Name" required />
              <FormField name="contact_name" type="text" label="Contact Name" required />
              <FormField name="email" type="email" label="Email" required />
              <FormField name="phone" type="text" label="Phone" />
              <FormField name="industry" type="select" label="Industry" options={industryOptions} placeholder="Select Industry" />
              <FormField name="status" type="select" label="Status" options={statusOptions} required />
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <Button type="submit" loading={saving} icon={Save}>Update Customer</Button>
              <Link href={`/customers/${id}`}><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </Form>
        </Formik>
      </Card>
    </div>
  );
}
