"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function CreateCustomerPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "superadmin") {
      router.replace("/interactions");
    }
  }, [user, router]);

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Create Customer" description="Add a new customer to your portfolio" backHref="/customers" backLabel="Back to Customers" />

      <Card>
        <Formik
          initialValues={{ company_name: "", contact_name: "", email: "", phone: "", industry: "", status: "active" }}
          validationSchema={customerSchema}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await customerService.create(values);
              toast.success("Customer created successfully");
              router.push("/customers");
            } catch (err: unknown) {
              toast.error(getErrorMessage(err, "Failed to create customer"));
            } finally {
              setLoading(false);
            }
          }}
        >
          <Form className="space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField name="company_name" type="text" label="Company Name" placeholder="Acme Corp" required />
              <FormField name="contact_name" type="text" label="Contact Name" placeholder="John Doe" required />
              <FormField name="email" type="email" label="Email" placeholder="john@acme.com" required />
              <FormField name="phone" type="text" label="Phone" placeholder="+1 (555) 000-0000" />
              <FormField name="industry" type="select" label="Industry" options={industryOptions} placeholder="Select Industry" />
              <FormField name="status" type="select" label="Status" options={statusOptions} required />
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <Button type="submit" loading={loading} icon={Save}>Create Customer</Button>
              <Link href="/customers"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </Form>
        </Formik>
      </Card>
    </div>
  );
}
