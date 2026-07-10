"use client";

import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar";

export default function AttendanceCalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Attendance Calendar</h2>
        <p className="text-sm text-muted-foreground">
          View your clock-in/out times and approved leave
        </p>
      </div>
      <AttendanceCalendar />
    </div>
  );
}
