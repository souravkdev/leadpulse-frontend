"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useClockIn, useClockOut } from "@/hooks/useAttendance";
import type { AttendanceSessionStatus } from "@/types/attendance";

interface ClockToggleButtonProps {
  status: AttendanceSessionStatus | null;
}

export function ClockToggleButton({ status }: ClockToggleButtonProps) {
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const busy = clockIn.isPending || clockOut.isPending;

  const canClockIn = status === null || status === "clocked_out";
  const isWorking = status === "clocked_in";
  const isOnBreak = status === "on_break";

  async function handleClick() {
    try {
      if (canClockIn) {
        await clockIn.mutateAsync();
        toast.success("Clocked in");
      } else if (isWorking) {
        await clockOut.mutateAsync();
        toast.success("Clocked out");
      }
    } catch {
      toast.error("Action failed");
    }
  }

  const label = canClockIn
    ? "Clock In"
    : isWorking
      ? "Clocked In"
      : "On Break";

  const disabled = busy || isOnBreak;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      title={isOnBreak ? "End break on the Attendance page" : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-md h-11 px-6 text-base font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        canClockIn &&
          "border bg-background hover:bg-green-600 hover:text-white hover:border-green-600",
        isWorking &&
          "bg-green-600 text-white hover:bg-red-600 hover:border-red-600 border border-green-600",
        isOnBreak && "bg-amber-500 text-white cursor-not-allowed opacity-90",
        disabled && !isOnBreak && "opacity-50 cursor-not-allowed"
      )}
    >
      {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}
