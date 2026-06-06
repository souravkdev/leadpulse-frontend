"use client";

import { useState } from "react";
import { LeadsDataTable } from "@/components/leads/LeadsDataTable";
import { LeadFormDialog } from "@/components/leads/LeadFormDialog";
import { AddActivityDialog } from "@/components/leads/AddActivityDialog";
import type { Lead } from "@/types/lead";

export default function LeadsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [activityLead, setActivityLead] = useState<Lead | null>(null);

  function openCreate() {
    setEditingLead(null);
    setFormOpen(true);
  }

  function openEdit(lead: Lead) {
    setEditingLead(lead);
    setFormOpen(true);
  }

  function openLogActivity(lead: Lead) {
    setActivityLead(lead);
    setActivityOpen(true);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Leads</h2>
        <p className="text-sm text-muted-foreground">Manage your sales pipeline</p>
      </div>

      <LeadsDataTable
        onCreateNew={openCreate}
        onEdit={openEdit}
        onLogActivity={openLogActivity}
      />

      <LeadFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        lead={editingLead}
      />

      {activityLead && (
        <AddActivityDialog
          open={activityOpen}
          onClose={() => setActivityOpen(false)}
          leadId={activityLead.id}
          leadTitle={activityLead.title}
        />
      )}
    </div>
  );
}
