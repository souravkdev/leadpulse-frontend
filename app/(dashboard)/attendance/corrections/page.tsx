"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCorrections, useSubmitCorrection } from "@/hooks/useAttendance";

export default function CorrectionsPage() {
  const { data: corrections } = useCorrections();
  const submit = useSubmitCorrection();
  const [workDate, setWorkDate] = useState("");
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [reason, setReason] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submit.mutateAsync({
        work_date: workDate,
        requested_clock_in_at: clockIn ? new Date(clockIn).toISOString() : undefined,
        requested_clock_out_at: clockOut ? new Date(clockOut).toISOString() : undefined,
        reason,
      });
      toast.success("Correction request submitted");
      setWorkDate("");
      setClockIn("");
      setClockOut("");
      setReason("");
    } catch {
      toast.error("Failed to submit correction");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Attendance Corrections</h2>
        <p className="text-sm text-muted-foreground">
          Request a fix for missed or incorrect clock-in/out
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New Correction Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <Label>Work Date</Label>
              <Input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Correct Clock In</Label>
              <Input
                type="datetime-local"
                value={clockIn}
                onChange={(e) => setClockIn(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Correct Clock Out</Label>
              <Input
                type="datetime-local"
                value={clockOut}
                onChange={(e) => setClockOut(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Reason</Label>
              <textarea
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[80px]"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={submit.isPending}>
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {corrections?.map((c) => (
            <div key={c.id} className="rounded-md border p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">{c.work_date}</span>
                <Badge variant="outline">{c.status}</Badge>
              </div>
              <p className="text-muted-foreground">{c.reason}</p>
              {c.requested_clock_in_at && (
                <p>In: {format(new Date(c.requested_clock_in_at), "PPp")}</p>
              )}
              {c.requested_clock_out_at && (
                <p>Out: {format(new Date(c.requested_clock_out_at), "PPp")}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
