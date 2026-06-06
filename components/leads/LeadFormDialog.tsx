"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateLead, useUpdateLead } from "@/hooks/useLeads";
import type { Lead } from "@/types/lead";
import { STAGE_LABELS, STAGE_ORDER } from "@/types/lead";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  company_name: z.string().optional(),
  email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  phone: z.string().optional(),
  stage: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  source: z.string().optional(),
  value: z.string().optional(),
  notes: z.string().optional(),
  expected_close_date: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  lead?: Lead | null; // null = create mode
}

export function LeadFormDialog({ open, onClose, lead }: Props) {
  const isEdit = !!lead;
  const createLead = useCreateLead();
  const updateLead = useUpdateLead(lead?.id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (lead) {
        reset({
          title: lead.title,
          contact_name: lead.contact_name,
          company_name: lead.company_name ?? "",
          email: lead.email ?? "",
          phone: lead.phone ?? "",
          stage: lead.stage,
          priority: lead.priority,
          source: lead.source,
          value: lead.value != null ? String(lead.value) : "",
          notes: lead.notes ?? "",
          expected_close_date: lead.expected_close_date ?? "",
        });
      } else {
        reset({
          title: "",
          contact_name: "",
          company_name: "",
          email: "",
          phone: "",
          stage: "new",
          priority: "medium",
          source: "other",
          value: "",
          notes: "",
          expected_close_date: "",
        });
      }
    }
  }, [open, lead, reset]);

  async function onSubmit(data: FormData) {
    const payload = {
      ...data,
      email: data.email || undefined,
      company_name: data.company_name || undefined,
      phone: data.phone || undefined,
      notes: data.notes || undefined,
      expected_close_date: data.expected_close_date || undefined,
      value: data.value ? parseFloat(data.value) : undefined,
    };

    try {
      if (isEdit) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await updateLead.mutateAsync(payload as any);
        toast.success("Lead updated");
      } else {
        await createLead.mutateAsync(payload as Parameters<typeof createLead.mutateAsync>[0]);
        toast.success("Lead created");
      }
      onClose();
    } catch {
      toast.error(isEdit ? "Failed to update lead" : "Failed to create lead");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lead" : "New Lead"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input placeholder="e.g. Enterprise deal with Acme" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Contact + Company row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Contact Name *</Label>
              <Input placeholder="John Smith" {...register("contact_name")} />
              {errors.contact_name && (
                <p className="text-xs text-destructive">{errors.contact_name.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Company</Label>
              <Input placeholder="Acme Corp" {...register("company_name")} />
            </div>
          </div>

          {/* Email + Phone row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" placeholder="john@acme.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input placeholder="+1 555 000 0000" {...register("phone")} />
            </div>
          </div>

          {/* Stage + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Stage</Label>
              <Select
                value={watch("stage") ?? "new"}
                onValueChange={(v) => setValue("stage", v ?? undefined)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STAGE_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select
                value={watch("priority") ?? "medium"}
                onValueChange={(v) =>
                  setValue("priority", v as "low" | "medium" | "high")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Value + Close Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Deal Value ($)</Label>
              <Input type="number" min={0} placeholder="50000" {...register("value")} />
              {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Expected Close Date</Label>
              <Input type="date" {...register("expected_close_date")} />
            </div>
          </div>

          {/* Source */}
          <div className="space-y-1">
            <Label>Source</Label>
            <Select
              value={watch("source") ?? "other"}
              onValueChange={(v) => setValue("source", v ?? undefined)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  ["website", "Website"],
                  ["referral", "Referral"],
                  ["cold_call", "Cold Call"],
                  ["social_media", "Social Media"],
                  ["email_campaign", "Email Campaign"],
                  ["trade_show", "Trade Show"],
                  ["other", "Other"],
                ].map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label>Notes</Label>
            <textarea
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px] resize-none"
              placeholder="Additional notes..."
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
