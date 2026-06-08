"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { Formik, Form, useFormikContext } from "formik";
import { interactionService } from "@/src/services/interactionService";
import { customerService } from "@/src/services/customerService";
import { Customer } from "@/src/types";
import { getErrorMessage } from "@/src/utils/getErrorMessage";
import toast from "react-hot-toast";
import FormField from "@/src/components/ui/FormField";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import PageHeader from "@/src/components/ui/PageHeader";
import { Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { interactionSchema } from "@/src/utils/validationSchemas";

const typeOptions = [
  { value: "meeting", label: "Meeting" }, { value: "call", label: "Call" },
  { value: "email", label: "Email" }, { value: "demo", label: "Demo" },
  { value: "support", label: "Support" },
];

function AiHint() {
  const { values } = useFormikContext<{ meeting_notes: string }>();
  if (!values.meeting_notes) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
      <Sparkles className="w-4 h-4 text-blue-600" />
      <p className="text-xs text-blue-700 font-medium">AI insights will be generated when you save this interaction</p>
    </div>
  );
}

export default function CreateInteractionPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "superadmin") {
      router.replace("/interactions");
    }
  }, [user, router]);

  useEffect(() => {
    customerService.list({ page: 1, page_size: 100 }).then((res) => setCustomers(res.items));
  }, []);

  const customerOptions = customers.map((c) => ({ value: String(c.id), label: c.company_name }));

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="New Interaction" description="Record a customer interaction" backHref="/interactions" backLabel="Back to Interactions" />
      <Card>
        <Formik
          initialValues={{ customer_id: "", title: "", interaction_type: "meeting", meeting_notes: "", meeting_date: "" }}
          validationSchema={interactionSchema}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await interactionService.create({ ...values, customer_id: Number(values.customer_id) } as Parameters<typeof interactionService.create>[0]);
              toast.success("Interaction created successfully");
              router.push("/interactions");
            } catch (err: unknown) {
              toast.error(getErrorMessage(err, "Failed to create interaction"));
            } finally { setLoading(false); }
          }}
        >
          <Form className="space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField name="customer_id" type="select" label="Customer" options={customerOptions} placeholder="Select Customer" required />
              <FormField name="interaction_type" type="select" label="Type" options={typeOptions} required />
              <FormField name="title" type="text" label="Title" placeholder="Q4 Planning Meeting" required colSpan={2} />
              <FormField name="meeting_date" type="datetime" label="Meeting Date" required colSpan={2} />
              <FormField name="meeting_notes" type="textarea" label="Meeting Notes" placeholder="Enter detailed meeting notes here..." rows={7} helperText="AI will automatically generate insights from your notes." colSpan={2} />
            </div>
            <AiHint />
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <Button type="submit" loading={loading} icon={Save}>Create Interaction</Button>
              <Link href="/interactions"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </Form>
        </Formik>
      </Card>
    </div>
  );
}
