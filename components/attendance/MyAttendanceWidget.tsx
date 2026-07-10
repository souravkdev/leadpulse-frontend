"use client";

import Link from "next/link";
import { format, parse } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodayAttendance } from "@/hooks/useAttendance";
import { useLeaveBalances } from "@/hooks/useLeave";
import { STATUS_LABELS } from "@/types/attendance";
import { LeaveDonutChart } from "@/components/attendance/LeaveDonutChart";
import { ClockToggleButton } from "@/components/attendance/ClockToggleButton";

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatShiftTime(time: string) {
  const parsed = parse(time, "HH:mm:ss", new Date());
  return format(parsed, "h:mm a");
}

function formatShiftRange(start: string | null, end: string | null) {
  if (!start || !end) return null;
  return `${formatShiftTime(start)} – ${formatShiftTime(end)}`;
}

export function MyAttendanceWidget() {
  const { data: today, isLoading: todayLoading } = useTodayAttendance();
  const { data: balances, isLoading: balLoading } = useLeaveBalances();

  if (todayLoading || balLoading) {
    return <Skeleton className="h-36 w-full" />;
  }

  const session = today?.session;
  const statusLabel = session ? STATUS_LABELS[session.status] : "Not clocked in";
  const shiftRange = formatShiftRange(
    today?.shift_start_time ?? null,
    today?.shift_end_time ?? null
  );

  return (
    <Card className="overflow-visible">
      <CardContent className="p-4 sm:p-6 overflow-visible">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between overflow-visible">
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-sm font-medium">My Attendance</h3>
            {today?.shift_warning ? (
              <p className="text-sm text-amber-600">No shift assigned for today</p>
            ) : today?.shift_name ? (
              <p className="text-sm text-muted-foreground">
                Shift: {today.shift_name}
                {shiftRange && ` (${shiftRange})`}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span>
                <span className="text-muted-foreground">Status: </span>
                <span className="font-medium">{statusLabel}</span>
              </span>
              {session?.clock_in_at && (
                <span>
                  <span className="text-muted-foreground">In </span>
                  <span className="font-medium">
                    {format(new Date(session.clock_in_at), "h:mm a")}
                  </span>
                </span>
              )}
              {session && (
                <>
                  <span>
                    <span className="text-muted-foreground">Work </span>
                    <span className="font-medium">
                      {formatMinutes(today?.elapsed_work_minutes ?? 0)}
                    </span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Break </span>
                    <span className="font-medium">
                      {formatMinutes(today?.elapsed_break_minutes ?? 0)}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 overflow-visible">
            <LeaveDonutChart balances={balances ?? []} />
            <p className="text-xs text-muted-foreground hidden sm:block max-w-[100px]">
              Hover chart for leave breakdown
            </p>
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
            <ClockToggleButton status={session?.status ?? null} />
            <div className="flex gap-2 justify-end">
              <Link
                href="/attendance/leave"
                className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
              >
                Leave
              </Link>
              <Link
                href="/attendance/calendar"
                className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
              >
                Calendar
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
