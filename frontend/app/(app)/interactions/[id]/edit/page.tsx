"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { Formik, Form } from "formik";
import { interactionService } from "@/src/services/interactionService";
import { getErrorMessage } from "@/src/utils/getErrorMessage";
import toast from "react-hot-toast";
import FormField from "@/src/components/ui/FormField";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import PageHeader from "@/src/components/ui/PageHeader";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";
import { Save } from "lucide-react";
import Link from "next/link";
import { interactionUpdateSchema } from "@/src/utils/validationSchemas";

const typeOptions = [
  { value: "meeting", label: "Meeting" }, { value: "call", label: "Call" },
  { value: "email", label: "Email" }, { value: "demo", label: "Demo" },
  { value: "support", label: "Support" },
];

export default function EditInteractionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialValues, setInitialValues] = useState({ title: "", interaction_type: "meeting", meeting_notes: "", meeting_date: "" });

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "superadmin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (id) {
      interactionService.get(Number(id)).then((data) => {
        setInitialValues({
          title: data.title,
          interaction_type: data.interaction_type,
          meeting_notes: data.meeting_notes || "",
          meeting_date: data.meeting_date ? new Date(data.meeting_date).toISOString().slice(0, 16) : "",
        });
        setPageLoading(false);
      }).catch(() => { toast.error("Failed to load interaction"); setPageLoading(false); });
    }
  }, [id]);

  if (pageLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Edit Interaction" description="Update interaction details" backHref={`/interactions/${id}`} backLabel="Back to Interaction" />
      <Card>
        <Formik
          initialValues={initialValues}
          validationSchema={interactionUpdateSchema}
          enableReinitialize
          onSubmit={async (values) => {
            setSaving(true);
            try {
              await interactionService.update(Number(id), values as Parameters<typeof interactionService.update>[1]);
              toast.success("Interaction updated");
              router.push(`/interactions/${id}`);
            } catch (err: unknown) {
              toast.error(getErrorMessage(err, "Failed to update interaction"));
            } finally { setSaving(false); }
          }}
        >
          <Form className="space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField name="title" type="text" label="Title" required colSpan={2} />
              <FormField name="interaction_type" type="select" label="Type" options={typeOptions} required />
              <FormField name="meeting_date" type="datetime" label="Meeting Date" required />
              <FormField name="meeting_notes" type="textarea" label="Meeting Notes" rows={7} helperText="Updating notes will regenerate AI insights." colSpan={2} />
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <Button type="submit" loading={saving} icon={Save}>Update Interaction</Button>
              <Link href={`/interactions/${id}`}><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </Form>
        </Formik>
      </Card>
    </div>
  );
}
