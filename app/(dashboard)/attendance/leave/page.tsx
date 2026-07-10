"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useLeaveBalances,
  useLeaveApplications,
  useApplyLeave,
  useCancelLeave,
} from "@/hooks/useLeave";
import { LEAVE_STATUS_LABELS, LEAVE_TYPE_LABELS, HALF_DAY_PERIOD_LABELS } from "@/types/attendance";
import type { LeaveType } from "@/types/attendance";

export default function LeavePage() {
  const { data: balances } = useLeaveBalances();
  const { data: applications } = useLeaveApplications();
  const applyLeave = useApplyLeave();
  const cancelLeave = useCancelLeave();

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      leave_type: "paid" as LeaveType,
      start_date: "",
      end_date: "",
      is_half_day: false,
      half_day_period: "",
      reason: "",
    },
  });

  const isHalfDay = watch("is_half_day");
  const leaveType = watch("leave_type");

  async function onSubmit(data: {
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    is_half_day: boolean;
    half_day_period: string;
    reason: string;
  }) {
    try {
      await applyLeave.mutateAsync({
        leave_type: data.leave_type,
        start_date: data.start_date,
        end_date: data.is_half_day ? data.start_date : data.end_date,
        is_half_day: data.is_half_day,
        half_day_period: data.is_half_day
          ? (data.half_day_period as "morning" | "afternoon")
          : undefined,
        reason: data.reason,
      });
      toast.success("Leave application submitted");
      reset();
    } catch (err) {
      const detail =
        err instanceof AxiosError ? err.response?.data?.detail : undefined;
      toast.error(typeof detail === "string" ? detail : "Failed to submit leave application");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Leave</h2>
        <p className="text-sm text-muted-foreground">Balances and applications</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {balances
          ?.filter((b) => b.leave_type !== "unpaid")
          .map((b) => (
          <Card key={b.leave_type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{LEAVE_TYPE_LABELS[b.leave_type]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{b.balance}</p>
              <p className="text-xs text-muted-foreground">
                Accrued {b.accrued} · Used {b.used}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Apply for Leave</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <Label>Leave Type</Label>
              <Select
                value={watch("leave_type")}
                onValueChange={(v) => setValue("leave_type", v as LeaveType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAVE_TYPE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {leaveType === "unpaid" && (
                <p className="text-xs text-muted-foreground">No balance required.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Input type="date" {...register("start_date", { required: true })} />
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <Input
                  type="date"
                  disabled={isHalfDay}
                  {...register("end_date", { required: !isHalfDay })}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isHalfDay}
                onChange={(e) => setValue("is_half_day", e.target.checked)}
              />
              Half day
            </label>
            {isHalfDay && (
              <Select onValueChange={(v) => setValue("half_day_period", (v ?? "") as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Morning or afternoon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="space-y-1">
              <Label>Reason</Label>
              <textarea
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[80px]"
                {...register("reason", { required: true })}
              />
            </div>
            <Button type="submit" disabled={applyLeave.isPending}>
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {applications?.length === 0 && (
            <p className="text-sm text-muted-foreground">No applications yet.</p>
          )}
          {applications?.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {LEAVE_TYPE_LABELS[app.leave_type]} · {app.days_requested} day(s)
                  {app.is_half_day && app.half_day_period && (
                    <> · Half day · {HALF_DAY_PERIOD_LABELS[app.half_day_period]}</>
                  )}
                </p>
                <p className="text-muted-foreground">
                  {app.start_date}
                  {app.end_date !== app.start_date ? ` → ${app.end_date}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{LEAVE_STATUS_LABELS[app.status]}</Badge>
                {app.status === "pending" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => cancelLeave.mutate(app.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
