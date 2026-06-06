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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Lead, LeadStage } from "@/types/lead";
import {
  STAGE_LABELS,
  STAGE_COLORS,
  STAGE_ORDER,
  PRIORITY_COLORS,
} from "@/types/lead";
import { usePermissions } from "@/hooks/usePermissions";
import { DollarSign } from "lucide-react";

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
  const stageLeads = leads.filter((l) => l.stage === stage);
  const stageValue = stageLeads.reduce((sum, l) => sum + (l.value ?? 0), 0);

  return (
    <div className="flex flex-col min-w-[240px] w-[240px]">
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
        className="flex flex-col gap-2 min-h-[100px] rounded-lg bg-muted/40 p-2"
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
            className="bg-card cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
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

  const { data, isLoading } = useQuery<{ items: Lead[] }>({
    queryKey: ["leads", { page: 1, page_size: 200 }],
    queryFn: () =>
      api.get("/leads", { params: { page: 1, page_size: 200 } }).then((r) => r.data),
  });

  const updateStage = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: LeadStage }) =>
      api.patch(`/leads/${id}/stage`, { stage }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
    onError: () => toast.error("Failed to update stage"),
  });

  function handleDrop(leadId: string, newStage: LeadStage) {
    const lead = data?.items.find((l) => l.id === leadId);
    if (!lead || lead.stage === newStage) return;
    if (!canEditLead(lead.created_by_id)) {
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Pipeline</h2>
        <p className="text-sm text-muted-foreground">
          Drag &amp; drop leads between stages
        </p>
      </div>
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
