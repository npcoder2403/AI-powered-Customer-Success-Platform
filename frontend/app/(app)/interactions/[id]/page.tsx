"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchInteraction } from "@/src/store/interactionSlice";
import { AppDispatch, RootState } from "@/src/store/store";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import PageHeader from "@/src/components/ui/PageHeader";
import Link from "next/link";
import { Pencil, Calendar, Building, AlertTriangle, CheckCircle2, FileText, Sparkles } from "lucide-react";

export default function InteractionDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { current: interaction, loading } = useSelector((state: RootState) => state.interactions);

  useEffect(() => { if (id) dispatch(fetchInteraction(Number(id))); }, [dispatch, id]);

  if (loading) return <LoadingSpinner />;
  if (!interaction) return <div className="text-center py-12 text-slate-500">Interaction not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={interaction.title}
        backHref="/interactions"
        backLabel="Back to Interactions"
        actions={
          <Link href={`/interactions/${interaction.id}/edit`}>
            <Button icon={Pencil} size="sm">Edit</Button>
          </Link>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-5 border-b border-slate-100">
          <Badge>{interaction.interaction_type}</Badge>
          {interaction.ai_insight && <Badge>{interaction.ai_insight.sentiment}</Badge>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building className="w-[18px] h-[18px] text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{interaction.customer_name || `#${interaction.customer_id}`}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-[18px] h-[18px] text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Date</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{new Date(interaction.meeting_date).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-[18px] h-[18px] text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Type</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5 capitalize">{interaction.interaction_type}</p>
            </div>
          </div>
        </div>

        {interaction.meeting_notes && (
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Meeting Notes</p>
            <div className="bg-slate-50 rounded-xl p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100">
              {interaction.meeting_notes}
            </div>
          </div>
        )}
      </Card>

      {interaction.ai_insight && (
        <Card>
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">AI Insights</h3>
              <p className="text-xs text-slate-400">Automatically generated analysis</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Summary</p>
              <p className="text-sm text-slate-700 leading-relaxed">{interaction.ai_insight.summary}</p>
            </div>

            {interaction.ai_insight.action_items.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Action Items</p>
                <div className="space-y-2">
                  {interaction.ai_insight.action_items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-emerald-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {interaction.ai_insight.risks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Risks</p>
                <div className="space-y-2">
                  {interaction.ai_insight.risks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-red-50 rounded-lg border border-red-100">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-800">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
