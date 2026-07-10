"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAttendanceCalendar } from "@/hooks/useAttendance";
import { LEAVE_TYPE_LABELS } from "@/types/attendance";
import { useState } from "react";
import { CalendarDayDetail } from "@/components/attendance/CalendarDayDetail";

export function AttendanceCalendar() {
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const monthStr = format(current, "yyyy-MM");
  const { data, isLoading } = useAttendanceCalendar(monthStr);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();

  const dayMap = new Map(data?.days.map((d) => [d.date, d]) ?? []);

  function handleDayClick(key: string) {
    setSelectedDate(key);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setCurrent(subMonths(current, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold">{format(current, "MMMM yyyy")}</h3>
        <Button variant="outline" size="icon" onClick={() => setCurrent(addMonths(current, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse bg-muted rounded-lg" />
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const entry = dayMap.get(key);
            const hasSession = !!entry?.session;
            const onLeave = entry?.on_leave;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleDayClick(key)}
                className={`min-h-[72px] rounded-md border p-1 text-xs text-left transition-colors hover:ring-2 hover:ring-primary/30 cursor-pointer ${
                  onLeave
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30"
                    : hasSession
                      ? "bg-green-50 border-green-200 dark:bg-green-950/30"
                      : "bg-card"
                } ${!isSameMonth(day, current) ? "opacity-40" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium mb-0.5">{format(day, "d")}</p>
                  {entry?.has_missing_clock_out && (
                    <AlertCircle className="h-3 w-3 text-amber-600 shrink-0" />
                  )}
                </div>
                {onLeave && (
                  <p className="text-blue-600 truncate">
                    {entry?.is_half_day ? "½ " : ""}
                    {entry?.leave_type ? LEAVE_TYPE_LABELS[entry.leave_type] : "Leave"}
                  </p>
                )}
                {entry?.session?.clock_in_at && (
                  <p className="text-muted-foreground truncate">
                    In: {format(new Date(entry.session.clock_in_at), "HH:mm")}
                  </p>
                )}
                {entry?.session?.clock_out_at && (
                  <p className="text-muted-foreground truncate">
                    Out: {format(new Date(entry.session.clock_out_at), "HH:mm")}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      <CalendarDayDetail
        date={selectedDate}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
