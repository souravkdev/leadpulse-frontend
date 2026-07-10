"use client";

import Link from "next/link";
import { ClockPanel } from "@/components/attendance/ClockPanel";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Attendance</h2>
          <p className="text-sm text-muted-foreground">
            Clock in, take breaks, and clock out for the day
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/attendance/calendar"
            className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            Calendar
          </Link>
          <Link
            href="/attendance/corrections"
            className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            Corrections
          </Link>
        </div>
      </div>
      <ClockPanel />
    </div>
  );
}
