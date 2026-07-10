"use client";

import { useState } from "react";
import { format } from "date-fns";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDayAttendance, useSubmitCorrection } from "@/hooks/useAttendance";
import {
  BREAK_TYPE_LABELS,
  HALF_DAY_PERIOD_LABELS,
  LEAVE_TYPE_LABELS,
} from "@/types/attendance";
import type { DaySessionDetail } from "@/types/attendance";

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function toDatetimeLocalValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface CalendarDayDetailProps {
  date: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SessionCorrectionForm({
  workDate,
  session,
  onSuccess,
}: {
  workDate: string;
  session: DaySessionDetail;
  onSuccess: () => void;
}) {
  const submit = useSubmitCorrection();
  const [clockIn, setClockIn] = useState(toDatetimeLocalValue(session.clock_in_at));
  const [clockOut, setClockOut] = useState(toDatetimeLocalValue(session.clock_out_at));
  const [reason, setReason] = useState("");
  const [expanded, setExpanded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submit.mutateAsync({
        work_date: workDate,
        session_id: session.id,
        requested_clock_in_at: clockIn ? new Date(clockIn).toISOString() : undefined,
        requested_clock_out_at: clockOut ? new Date(clockOut).toISOString() : undefined,
        reason,
      });
      toast.success("Correction request submitted");
      setExpanded(false);
      setReason("");
      onSuccess();
    } catch (err) {
      const detail =
        err instanceof AxiosError ? err.response?.data?.detail : undefined;
      toast.error(typeof detail === "string" ? detail : "Failed to submit correction");
    }
  }

  if (session.pending_correction_id) {
    return (
      <Badge variant="outline" className="text-xs">
        Correction pending
      </Badge>
    );
  }

  if (!expanded) {
    return (
      <Button size="sm" variant="outline" onClick={() => setExpanded(true)}>
        Request Correction
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2 rounded-md border p-3 bg-muted/30">
      <div className="space-y-1">
        <Label className="text-xs">Correct Clock In</Label>
        <Input
          type="datetime-local"
          value={clockIn}
          onChange={(e) => setClockIn(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Correct Clock Out</Label>
        <Input
          type="datetime-local"
          value={clockOut}
          onChange={(e) => setClockOut(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Reason</Label>
        <textarea
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs min-h-[60px]"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submit.isPending}>
          Submit
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function CalendarDayDetail({ date, open, onOpenChange }: CalendarDayDetailProps) {
  const { data, isLoading, refetch } = useDayAttendance(date);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {date ? format(new Date(date + "T12:00:00"), "EEEE, MMM d, yyyy") : "Day Detail"}
          </SheetTitle>
        </SheetHeader>

        {isLoading && (
          <div className="mt-6 h-40 animate-pulse rounded-md bg-muted" />
        )}

        {!isLoading && data && (
          <div className="mt-4 space-y-4">
            {data.on_leave && data.leave_type && (
              <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm dark:bg-blue-950/30">
                {data.is_half_day ? "½ " : ""}
                {LEAVE_TYPE_LABELS[data.leave_type]}
                {data.is_half_day && data.half_day_period && (
                  <> · {HALF_DAY_PERIOD_LABELS[data.half_day_period]}</>
                )}
              </div>
            )}

            {data.sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendance records for this day.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>In</TableHead>
                    <TableHead>Out</TableHead>
                    <TableHead>Work</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sessions.map((session, idx) => (
                    <TableRow key={session.id}>
                      <TableCell className="align-top">{idx + 1}</TableCell>
                      <TableCell className="align-top text-xs">
                        {format(new Date(session.clock_in_at), "HH:mm")}
                      </TableCell>
                      <TableCell className="align-top text-xs">
                        {session.clock_out_at
                          ? format(new Date(session.clock_out_at), "HH:mm")
                          : "—"}
                      </TableCell>
                      <TableCell className="align-top text-xs">
                        {formatMinutes(session.work_minutes)}
                      </TableCell>
                      <TableCell className="align-top">
                        {session.missing_clock_out ? (
                          <Badge variant="destructive" className="text-xs">
                            Missing clock out
                          </Badge>
                        ) : session.status === "on_break" ? (
                          <Badge variant="outline" className="text-xs">
                            On break
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Complete
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {data.sessions.map((session, idx) => (
              <div key={`detail-${session.id}`} className="rounded-md border p-3 text-sm space-y-2">
                <p className="font-medium">Session {idx + 1} — Breaks</p>
                {session.breaks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No breaks recorded.</p>
                ) : (
                  <ul className="space-y-1 text-xs">
                    {session.breaks.map((b) => (
                      <li key={b.id} className="flex justify-between gap-2">
                        <span>{BREAK_TYPE_LABELS[b.break_type]}</span>
                        <span className="text-muted-foreground">
                          {format(new Date(b.start_at), "HH:mm")}
                          {b.end_at ? ` – ${format(new Date(b.end_at), "HH:mm")}` : " – ongoing"}
                          {b.duration_minutes != null && ` (${b.duration_minutes}m)`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <SessionCorrectionForm
                  workDate={data.date}
                  session={session}
                  onSuccess={() => refetch()}
                />
              </div>
            ))}

            {data.sessions.length > 0 && (
              <div className="rounded-md bg-muted/40 px-3 py-2 text-sm font-medium">
                Total work: {formatMinutes(data.total_work_minutes)} · Total break:{" "}
                {formatMinutes(data.total_break_minutes)}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
