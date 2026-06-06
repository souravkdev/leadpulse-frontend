"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Activity } from "@/types/lead";
import { format } from "date-fns";
import { Phone, Mail, Users, StickyNote, CheckSquare } from "lucide-react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: StickyNote,
  task: CheckSquare,
};

const TYPE_COLORS: Record<string, string> = {
  call: "bg-activity-call text-activity-call-foreground",
  email: "bg-activity-email text-activity-email-foreground",
  meeting: "bg-activity-meeting text-activity-meeting-foreground",
  note: "bg-activity-note text-activity-note-foreground",
  task: "bg-activity-task text-activity-task-foreground",
};

export default function ActivitiesPage() {
  const { data, isLoading } = useQuery<{ items: Array<Activity & { lead?: { title: string } }> }>({
    queryKey: ["activities-recent"],
    queryFn: async () => {
      // Fetch all leads then their activities — simplified for scaffold
      const leadsRes = await api.get("/leads", { params: { page: 1, page_size: 50 } });
      const allActivities: (Activity & { lead_title?: string })[] = [];
      for (const lead of (leadsRes.data?.items ?? []).slice(0, 10)) {
        const actRes = await api.get(`/leads/${lead.id}/activities`);
        for (const act of actRes.data ?? []) {
          allActivities.push({ ...act, lead_title: lead.title });
        }
      }
      allActivities.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return { items: allActivities.slice(0, 50) };
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Activities</h2>
        <p className="text-sm text-muted-foreground">Recent activity log</p>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.items.length ? (
              (data.items as (Activity & { lead_title?: string })[]).map((act) => {
                const Icon = TYPE_ICONS[act.type] ?? StickyNote;
                return (
                  <TableRow key={act.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize gap-1 ${TYPE_COLORS[act.type]}`}
                      >
                        <Icon className="h-3 w-3" />
                        {act.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <p className="text-sm truncate">{act.description}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {act.lead_title ?? act.lead_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{act.user?.full_name ?? "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(act.created_at), "MMM d, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {act.completed_at ? (
                        <Badge variant="outline" className="text-xs bg-status-active text-status-active-foreground">
                          Done
                        </Badge>
                      ) : act.due_date ? (
                        <Badge variant="outline" className="text-xs bg-status-inactive text-status-inactive-foreground">
                          Pending
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No activities yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
