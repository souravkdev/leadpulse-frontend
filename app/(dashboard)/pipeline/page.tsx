"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Lead, LeadStage } from "@/types/lead";
import {
  STAGE_LABELS,
  STAGE_COLORS,
  STAGE_ORDER,
  PRIORITY_COLORS,
} from "@/types/lead";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore } from "@/stores/authStore";
import { DollarSign } from "lucide-react";

const STAGE_COLUMN_STYLES: Record<LeadStage, { column: string; dropZone: string; cardAccent: string }> = {
  new: {
    column: "border-stage-new bg-stage-new/30",
    dropZone: "border-stage-new bg-stage-new/20 border-dashed",
    cardAccent: "border-l-stage-new-foreground",
  },
  contacted: {
    column: "border-stage-contacted bg-stage-contacted/30",
    dropZone: "border-stage-contacted bg-stage-contacted/20 border-dashed",
    cardAccent: "border-l-stage-contacted-foreground",
  },
  qualified: {
    column: "border-stage-qualified bg-stage-qualified/30",
    dropZone: "border-stage-qualified bg-stage-qualified/20 border-dashed",
    cardAccent: "border-l-stage-qualified-foreground",
  },
  proposal: {
    column: "border-stage-proposal bg-stage-proposal/30",
    dropZone: "border-stage-proposal bg-stage-proposal/20 border-dashed",
    cardAccent: "border-l-stage-proposal-foreground",
  },
  negotiation: {
    column: "border-stage-negotiation bg-stage-negotiation/30",
    dropZone: "border-stage-negotiation bg-stage-negotiation/20 border-dashed",
    cardAccent: "border-l-stage-negotiation-foreground",
  },
  won: {
    column: "border-stage-won bg-stage-won/30",
    dropZone: "border-stage-won bg-stage-won/20 border-dashed",
    cardAccent: "border-l-stage-won-foreground",
  },
  lost: {
    column: "border-stage-lost bg-stage-lost/30",
    dropZone: "border-stage-lost bg-stage-lost/20 border-dashed",
    cardAccent: "border-l-stage-lost-foreground",
  },
};

function StageColumn({
  stage,
  leads,
  onDrop,
  canEdit,
}: {
  stage: LeadStage;
  leads: Lead[];
  onDrop: (leadId: string, stage: LeadStage) => void;
  canEdit: boolean;
}) {
  const styles = STAGE_COLUMN_STYLES[stage];
  const stageLeads = leads.filter((l) => l.stage === stage);
  const stageValue = stageLeads.reduce((sum, l) => sum + (l.value ?? 0), 0);

  return (
    <div className={`flex flex-col min-w-[260px] w-[260px] min-h-[80vh] rounded-xl border p-3 shadow-sm ${styles.column}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${STAGE_COLORS[stage]}`}
          >
            {STAGE_LABELS[stage]}
          </span>
          <span className="text-xs text-muted-foreground">
            {stageLeads.length}
          </span>
        </div>
        {stageValue > 0 && (
          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
            <DollarSign className="h-3 w-3" />
            {new Intl.NumberFormat("en-US", {
              notation: "compact",
            }).format(stageValue)}
          </span>
        )}
      </div>

      <div
        className={`flex flex-1 flex-col gap-2 min-h-[120px] rounded-lg border border-dashed p-2 ${styles.dropZone}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const leadId = e.dataTransfer.getData("leadId");
          onDrop(leadId, stage);
        }}
      >
        {stageLeads.map((lead) => (
          <Card
            key={lead.id}
            className={`bg-card cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow border-l-4 ${styles.cardAccent}`}
            draggable={canEdit}
            onDragStart={(e) => {
              e.dataTransfer.setData("leadId", lead.id);
            }}
          >
            <CardContent className="p-3 space-y-1.5">
              <p className="text-sm font-medium leading-tight">{lead.title}</p>
              {lead.company_name && (
                <p className="text-xs text-muted-foreground">
                  {lead.company_name}
                </p>
              )}
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={`text-xs capitalize ${PRIORITY_COLORS[lead.priority]}`}
                >
                  {lead.priority}
                </Badge>
                {lead.value && (
                  <span className="text-xs text-muted-foreground">
                    ${new Intl.NumberFormat("en-US", { notation: "compact" }).format(lead.value)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const qc = useQueryClient();
  const { canEditLead } = usePermissions();
  const currentUser = useAuthStore((s) => s.user);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<{ items: Lead[]; total?: number }>({
    queryKey: ["leads", "pipeline", currentUser?.id, { page: 1, page_size: 100 }],
    queryFn: () =>
      api.get("/leads", { params: { page: 1, page_size: 100 } }).then((r) => r.data),
    refetchOnMount: "always",
  });

  const updateStage = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: LeadStage }) =>
      api.patch(`/leads/${id}/stage`, { stage }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
    onError: () => toast.error("Failed to update stage"),
  });

  function handleDrop(leadId: string, newStage: LeadStage) {
    if (!leadId) return;
    const lead = data?.items.find((l) => l.id === leadId);
    if (!lead || lead.stage === newStage) return;
    if (!canEditLead(lead.created_by_id, lead.assigned_to_id)) {
      toast.error("You don't have permission to edit this lead");
      return;
    }
    updateStage.mutate({ id: leadId, stage: newStage });
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGE_ORDER.map((s) => (
          <div key={s} className="min-w-[240px] space-y-2">
            <Skeleton className="h-6 w-28" />
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            Drag &amp; drop leads between stages
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unable to load leads</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>
              {(error as Error)?.message || "Failed to fetch pipeline data from backend."}
            </p>
            <p>Make sure backend is running and your session is still valid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Pipeline</h2>
        <p className="text-sm text-muted-foreground">
          Drag &amp; drop leads between stages
        </p>
      </div>
      {(data?.items?.length ?? 0) === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No leads visible in pipeline</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>Create a lead from the Leads page, or assign it to this user.</p>
            <p>Sales agents only see leads they created or leads assigned to them.</p>
          </CardContent>
        </Card>
      )}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGE_ORDER.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            leads={data?.items ?? []}
            onDrop={handleDrop}
            canEdit={true}
          />
        ))}
      </div>
    </div>
  );
}
