"use client";

import { Loader2, LogIn, LogOut, Coffee, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useTodayAttendance,
  useClockIn,
  useClockOut,
  useStartBreak,
  useEndBreak,
} from "@/hooks/useAttendance";
import { BREAK_TYPE_LABELS, STATUS_LABELS } from "@/types/attendance";
import { format } from "date-fns";

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function ClockPanel() {
  const { data, isLoading } = useTodayAttendance();
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const startBreak = useStartBreak();
  const endBreak = useEndBreak();

  const session = data?.session;
  const status = session?.status;
  const isWorking = status === "clocked_in";
  const isOnBreak = status === "on_break";
  const isDone = status === "clocked_out";
  const canClockIn = !session || status === "clocked_out";
  const busy =
    clockIn.isPending ||
    clockOut.isPending ||
    startBreak.isPending ||
    endBreak.isPending;

  async function handle(action: () => Promise<unknown>, success: string) {
    try {
      await action();
      toast.success(success);
    } catch {
      toast.error("Action failed");
    }
  }

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-lg bg-muted" />;
  }

  const lunchBreaksLeft = Math.max(0, 1 - (data?.lunch_breaks_taken ?? 0));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Today&apos;s Attendance</CardTitle>
          {session && (
            <Badge variant="outline" className="capitalize">
              {STATUS_LABELS[session.status]}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.shift_warning && !isWorking && !isOnBreak && (
          <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-md px-3 py-2">
            No shift assigned for today. You can still clock in.
          </p>
        )}
        {data?.shift_name && (
          <p className="text-sm text-muted-foreground font-medium">Shift: {data.shift_name}</p>
        )}

        {session?.clock_in_at && (
          <div className="grid grid-cols-2 gap-3 text-sm border rounded-md p-3 bg-muted/10">
            <div>
              <p className="text-muted-foreground text-xs">Clock In</p>
              <p className="font-medium">
                {format(new Date(session.clock_in_at), "h:mm a")}
              </p>
            </div>
            {session.clock_out_at && (
              <div>
                <p className="text-muted-foreground text-xs">Clock Out</p>
                <p className="font-medium">
                  {format(new Date(session.clock_out_at), "h:mm a")}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs">Total Work Time</p>
              <p className="font-medium">{formatMinutes(data?.elapsed_work_minutes ?? 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Break Time</p>
              <p className="font-medium">{formatMinutes(data?.elapsed_break_minutes ?? 0)}</p>
            </div>
          </div>
        )}

        {session && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today&apos;s Breaks</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border p-2.5 bg-muted/20">
                <p className="text-xs text-muted-foreground font-medium">Lunch ({data?.lunch_break_minutes}m)</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {lunchBreaksLeft > 0 ? "Available" : "Taken"}
                </p>
              </div>
            </div>
          </div>
        )}

        {data?.active_break && (
          <p className="text-sm text-blue-600 font-medium bg-blue-50 dark:bg-blue-950/20 px-3 py-2 rounded-md">
            On {BREAK_TYPE_LABELS[data.active_break.break_type]} since{" "}
            {format(new Date(data.active_break.start_at), "h:mm a")}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {canClockIn && (
            <Button
              disabled={busy}
              onClick={() => handle(() => clockIn.mutateAsync(), "Clocked in")}
            >
              {clockIn.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Clock In
            </Button>
          )}
          {isWorking && (
            <>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() =>
                  handle(() => startBreak.mutateAsync("short"), "Short break started")
                }
              >
                <Coffee className="mr-2 h-4 w-4" />
                Short Break
              </Button>
              <Button
                variant="outline"
                disabled={busy || lunchBreaksLeft <= 0}
                onClick={() =>
                  handle(() => startBreak.mutateAsync("lunch"), "Lunch break started")
                }
              >
                <UtensilsCrossed className="mr-2 h-4 w-4" />
                Lunch ({lunchBreaksLeft})
              </Button>
              <Button
                variant="destructive"
                disabled={busy}
                onClick={() => handle(() => clockOut.mutateAsync(), "Clocked out")}
              >
                {clockOut.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Clock Out
              </Button>
            </>
          )}
          {isOnBreak && (
            <Button
              disabled={busy}
              onClick={() => handle(() => endBreak.mutateAsync(), "Break ended")}
            >
              End Break
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
