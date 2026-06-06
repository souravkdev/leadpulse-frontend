"use client";

import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/types/lead";
import {
  STAGE_LABELS,
  STAGE_COLORS,
  PRIORITY_COLORS,
} from "@/types/lead";

interface Props {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export function ViewLeadDialog({ open, onClose, lead }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
        </DialogHeader>

        {!lead ? null : (
          <div className="space-y-5 py-1">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold leading-tight">{lead.title}</h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${STAGE_COLORS[lead.stage]}`}
                >
                  {STAGE_LABELS[lead.stage]}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs capitalize ${PRIORITY_COLORS[lead.priority]}`}
                >
                  {lead.priority}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Contact Name" value={lead.contact_name} />
              <Field label="Company" value={lead.company_name || "-"} />
              <Field label="Email" value={lead.email || "-"} />
              <Field label="Phone" value={lead.phone || "-"} />
              <Field
                label="Deal Value"
                value={
                  lead.value
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(lead.value)
                    : "-"
                }
              />
              <Field
                label="Expected Close Date"
                value={
                  lead.expected_close_date
                    ? format(new Date(lead.expected_close_date), "MMM d, yyyy")
                    : "-"
                }
              />
              <Field
                label="Source"
                value={lead.source.replace(/_/g, " ")}
              />
              <Field
                label="Assigned To"
                value={lead.assignee?.full_name || "Unassigned"}
              />
              <Field
                label="Created By"
                value={lead.creator?.full_name || "-"}
              />
              <Field
                label="Created"
                value={format(new Date(lead.created_at), "MMM d, yyyy, h:mm a")}
              />
              <Field
                label="Last Updated"
                value={format(new Date(lead.updated_at), "MMM d, yyyy, h:mm a")}
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Notes</p>
              <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm whitespace-pre-wrap min-h-[72px]">
                {lead.notes || "No notes added."}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
