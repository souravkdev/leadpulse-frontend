"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import {
  useShiftTemplates,
  useShiftAssignmentSummary,
  useLeavePolicies,
  useAttendanceProfiles,
  useAdminCorrections,
  useTeamAttendance,
  useCreateShiftTemplate,
  useDeleteShiftTemplate,
  useCreateShiftAssignment,
  useDeleteShiftAssignmentRange,
  useCreateLeavePolicy,
  useUpdateProfile,
  useReviewCorrection,
  useRunAccrual,
} from "@/hooks/useAttendanceAdmin";
import {
  usePendingLeaveApplications,
  useApproveLeave,
  useRejectLeave,
} from "@/hooks/useLeave";
import { LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS, HALF_DAY_PERIOD_LABELS } from "@/types/attendance";
import type { TeamAttendanceSummary } from "@/types/attendance";
import type { User } from "@/types/user";
import { usePermissions } from "@/hooks/usePermissions";

function teamLeaveBadge(m: TeamAttendanceSummary) {
  if (!m.today_leave_status) {
    if (m.today_status) {
      return <Badge variant="outline">{m.today_status}</Badge>;
    }
    return <span className="text-muted-foreground">Not clocked in</span>;
  }

  const parts: string[] = [];
  if (m.today_leave_status === "pending") parts.push("Pending");
  else if (m.on_leave) parts.push("On Leave");
  if (m.today_leave_type) parts.push(LEAVE_TYPE_LABELS[m.today_leave_type]);
  if (m.today_is_half_day) {
    parts.push("Half day");
    if (m.today_half_day_period) {
      parts.push(HALF_DAY_PERIOD_LABELS[m.today_half_day_period]);
    }
  }

  return (
    <Badge variant={m.today_leave_status === "pending" ? "secondary" : "default"}>
      {parts.join(" · ")}
    </Badge>
  );
}

export default function AttendanceAdminPage() {
  const { isAdmin, canApproveLeave } = usePermissions();
  const { data: templates, isLoading: templatesLoading } = useShiftTemplates();
  const { data: assignmentSummary, isLoading: assignmentSummaryLoading } =
    useShiftAssignmentSummary();
  const { data: policies } = useLeavePolicies();
  const { data: profiles } = useAttendanceProfiles();
  const { data: corrections } = useAdminCorrections("pending");
  const { data: team } = useTeamAttendance();
  const { data: pendingLeave } = usePendingLeaveApplications();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => api.get("/users").then((r) => r.data),
    enabled: isAdmin(),
  });

  const createTemplate = useCreateShiftTemplate();
  const deleteTemplate = useDeleteShiftTemplate();
  const createAssignment = useCreateShiftAssignment();
  const deleteAssignmentRange = useDeleteShiftAssignmentRange();
  const createPolicy = useCreateLeavePolicy();
  const updateProfile = useUpdateProfile();
  const reviewCorrection = useReviewCorrection();
  const runAccrual = useRunAccrual();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const [shiftName, setShiftName] = useState("");
  const [shiftStart, setShiftStart] = useState("09:00");
  const [shiftEnd, setShiftEnd] = useState("18:00");
  const [lunchBreakMinutes, setLunchBreakMinutes] = useState("30");
  const [shortBreakMinutes, setShortBreakMinutes] = useState("15");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignTemplateId, setAssignTemplateId] = useState("");
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignEndDate, setAssignEndDate] = useState("");
  const [policyType, setPolicyType] = useState("paid");
  const [policyAccrual, setPolicyAccrual] = useState("1");

  if (!isAdmin() && !canApproveLeave()) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          You do not have permission to access attendance administration.
        </CardContent>
      </Card>
    );
  }

  const defaultTab = canApproveLeave() ? "team" : "leave";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Attendance Admin</h2>
          <p className="text-sm text-muted-foreground">
            Shifts, leave policies, profiles, and approvals
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            runAccrual.mutate(undefined, {
              onSuccess: () => toast.success("Monthly accrual completed"),
            })
          }
          className={isAdmin() ? "" : "hidden"}
        >
          Run Monthly Accrual
        </Button>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {canApproveLeave() && <TabsTrigger value="team">Team</TabsTrigger>}
          {isAdmin() && <TabsTrigger value="shifts">Shifts</TabsTrigger>}
          {isAdmin() && <TabsTrigger value="policies">Policies</TabsTrigger>}
          {isAdmin() && <TabsTrigger value="profiles">Profiles</TabsTrigger>}
          {canApproveLeave() && <TabsTrigger value="leave">Leave Approvals</TabsTrigger>}
          {canApproveLeave() && <TabsTrigger value="corrections">Corrections</TabsTrigger>}
        </TabsList>

        <TabsContent value="team" className="space-y-3 mt-4">
          {canApproveLeave() &&
            team?.map((m) => (
              <div key={m.user_id} className="flex justify-between rounded-md border p-3 text-sm">
                <div>
                  <p className="font-medium">{m.user_name}</p>
                  <p className="text-muted-foreground capitalize">{m.role.replace(/_/g, " ")}</p>
                </div>
                <div className="text-right">{teamLeaveBadge(m)}</div>
              </div>
            ))}
        </TabsContent>

        <TabsContent value="shifts" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Create Shift Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="shift-name">Shift Name</Label>
                  <Input
                    id="shift-name"
                    placeholder="e.g. Morning Shift"
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shift-start">Start Time</Label>
                  <Input
                    id="shift-start"
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shift-end">End Time</Label>
                  <Input
                    id="shift-end"
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="lunch-duration">Lunch Break (minutes)</Label>
                  <Input
                    id="lunch-duration"
                    type="number"
                    min="0"
                    placeholder="30"
                    value={lunchBreakMinutes}
                    onChange={(e) => setLunchBreakMinutes(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="short-duration">Short Break (minutes)</Label>
                  <Input
                    id="short-duration"
                    type="number"
                    min="0"
                    placeholder="15"
                    value={shortBreakMinutes}
                    onChange={(e) => setShortBreakMinutes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  disabled={!shiftName.trim() || createTemplate.isPending}
                  onClick={() =>
                    createTemplate.mutate(
                      {
                        name: shiftName.trim(),
                        start_time: shiftStart,
                        end_time: shiftEnd,
                        lunch_break_minutes: parseInt(lunchBreakMinutes, 10) || 30,
                        short_break_minutes: parseInt(shortBreakMinutes, 10) || 15,
                      },
                      {
                        onSuccess: () => {
                          toast.success("Template created");
                          setShiftName("");
                        },
                        onError: (err: unknown) => {
                          const message =
                            (err as { response?: { data?: { detail?: string } } })?.response?.data
                              ?.detail ?? "Failed to create template";
                          toast.error(message);
                        },
                      }
                    )
                  }
                >
                  Create Shift Template
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shift Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templatesLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : !templates?.length ? (
                <p className="text-sm text-muted-foreground">No shift templates yet.</p>
              ) : (
                templates.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 text-sm border rounded p-3"
                  >
                    <div>
                      <span className="font-medium">{t.name}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {formatShiftTemplateTime(t.start_time)} –{" "}
                        {formatShiftTemplateTime(t.end_time)} · {formatDaysOfWeek(t.days_of_week)}
                        {" "} · Lunch: {t.lunch_break_minutes}m · Short: {t.short_break_minutes}m
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                      disabled={deleteTemplate.isPending}
                      onClick={() => {
                        if (
                          confirm(
                            `Delete shift template "${t.name}"? All employee assignments using this shift will also be removed.`
                          )
                        ) {
                          deleteTemplate.mutate(t.id, {
                            onSuccess: () => toast.success("Shift template deleted"),
                            onError: () => toast.error("Failed to delete shift template"),
                          });
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assign Shift</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Select employee and shift. Leave dates empty to assign for the full current month,
                or pick a range to override shifts for those days.
              </p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1">
                  <Label>Employee</Label>
                  <Select value={assignUserId} onValueChange={(v) => setAssignUserId(v ?? "")}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Shift</Label>
                  <Select value={assignTemplateId} onValueChange={(v) => setAssignTemplateId(v ?? "")}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>From (optional)</Label>
                  <Input
                    type="date"
                    value={assignStartDate}
                    onChange={(e) => setAssignStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>To (optional)</Label>
                  <Input
                    type="date"
                    value={assignEndDate}
                    onChange={(e) => setAssignEndDate(e.target.value)}
                  />
                </div>
                <Button
                  disabled={!assignUserId || !assignTemplateId || createAssignment.isPending}
                  onClick={() =>
                    createAssignment.mutate(
                      {
                        user_id: assignUserId,
                        shift_template_id: assignTemplateId,
                        ...(assignStartDate ? { start_date: assignStartDate } : {}),
                        ...(assignEndDate ? { end_date: assignEndDate } : {}),
                      },
                      {
                        onSuccess: (data: {
                          start_date: string;
                          end_date: string;
                          days_assigned: number;
                        }) =>
                          toast.success(
                            `Shift assigned for ${data.days_assigned} day(s) (${data.start_date} → ${data.end_date})`
                          ),
                        onError: () => toast.error("Failed to assign shift"),
                      }
                    )
                  }
                >
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shift Assignments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead className="w-16" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignmentSummaryLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : assignmentSummary?.length ? (
                      assignmentSummary.map((row) => (
                        <TableRow
                          key={`${row.user_id}-${row.shift_template_id}-${row.start_date}`}
                        >
                          <TableCell className="font-medium">
                            {row.user_name ?? "Unknown"}
                          </TableCell>
                          <TableCell>{row.shift_name ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatAssignmentDateRange(row.start_date, row.end_date)}
                          </TableCell>
                          <TableCell>{row.days_count}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              disabled={deleteAssignmentRange.isPending}
                              onClick={() => {
                                const label = formatAssignmentDateRange(
                                  row.start_date,
                                  row.end_date
                                );
                                if (
                                  confirm(
                                    `Remove shift assignment for ${row.user_name} (${label})?`
                                  )
                                ) {
                                  deleteAssignmentRange.mutate(
                                    {
                                      user_id: row.user_id,
                                      shift_template_id: row.shift_template_id,
                                      start_date: row.start_date,
                                      end_date: row.end_date,
                                    },
                                    {
                                      onSuccess: () =>
                                        toast.success("Shift assignment removed"),
                                      onError: () =>
                                        toast.error("Failed to remove shift assignment"),
                                    }
                                  );
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No shift assignments yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6 flex flex-wrap gap-3">
              <Select value={policyType} onValueChange={(v) => setPolicyType(v ?? "paid")}>
                <SelectTrigger className="w-40">
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
              <Input
                type="number"
                step="0.5"
                className="w-24"
                value={policyAccrual}
                onChange={(e) => setPolicyAccrual(e.target.value)}
              />
              <Button
                onClick={() =>
                  createPolicy.mutate(
                    { leave_type: policyType, accrual_per_month: parseFloat(policyAccrual) },
                    { onSuccess: () => toast.success("Policy created") }
                  )
                }
              >
                Add Policy
              </Button>
            </CardContent>
          </Card>
          {policies?.map((p) => (
            <div key={p.id} className="text-sm border rounded p-3">
              {LEAVE_TYPE_LABELS[p.leave_type]}: {p.accrual_per_month}/month
            </div>
          ))}
        </TabsContent>

        <TabsContent value="profiles" className="mt-4 space-y-3">
          {profiles?.map((p) => (
            <ProfileRow
              key={p.id}
              profile={p}
              users={users}
              onSave={(userId, manager_id) =>
                updateProfile.mutate(
                  { userId, manager_id },
                  { onSuccess: () => toast.success("Profile updated") }
                )
              }
            />
          ))}
        </TabsContent>

        <TabsContent value="leave" className="mt-4 space-y-3">
          {pendingLeave?.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending leave applications.</p>
          )}
          {pendingLeave?.map((app) => (
            <div key={app.id} className="border rounded p-3 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{app.user_name}</span>
                <Badge>{LEAVE_STATUS_LABELS[app.status]}</Badge>
              </div>
              <p>
                {LEAVE_TYPE_LABELS[app.leave_type]} · {app.days_requested} day(s) · {app.start_date}
                {app.end_date !== app.start_date ? ` → ${app.end_date}` : ""}
                {app.is_half_day && app.half_day_period && (
                  <> · Half day · {HALF_DAY_PERIOD_LABELS[app.half_day_period]}</>
                )}
              </p>
              <p className="text-muted-foreground">{app.reason}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => approveLeave.mutate(app.id)}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    rejectLeave.mutate({
                      id: app.id,
                      rejection_reason: "Not approved at this time",
                    })
                  }
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="corrections" className="mt-4 space-y-3">
          {corrections?.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending correction requests.</p>
          )}
          {corrections?.map((c) => (
            <div key={c.id} className="border rounded p-3 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{c.user_name ?? c.work_date}</span>
                <Badge variant="outline">{c.status}</Badge>
              </div>
              <p className="text-muted-foreground">{c.reason}</p>
              {c.original_clock_in_at && (
                <p className="text-xs">
                  Original in: {format(new Date(c.original_clock_in_at), "PPp")}
                  {c.original_clock_out_at &&
                    ` · out: ${format(new Date(c.original_clock_out_at), "PPp")}`}
                </p>
              )}
              {c.requested_clock_in_at && (
                <p className="text-xs">
                  Requested in: {format(new Date(c.requested_clock_in_at), "PPp")}
                  {c.requested_clock_out_at &&
                    ` · out: ${format(new Date(c.requested_clock_out_at), "PPp")}`}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    reviewCorrection.mutate(
                      { id: c.id, status: "approved" },
                      { onSuccess: () => toast.success("Correction approved") }
                    )
                  }
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    reviewCorrection.mutate(
                      { id: c.id, status: "rejected" },
                      { onSuccess: () => toast.success("Correction rejected") }
                    )
                  }
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatAssignmentDateRange(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  if (start === end) {
    return format(startDate, "MMM d, yyyy");
  }
  return `${format(startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`;
}

function formatShiftTemplateTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, "0")} ${period}`;
}

function formatDaysOfWeek(days: string) {
  const nums = days.split(",").map((d) => parseInt(d.trim(), 10));
  if (nums.length === 5 && nums.join(",") === "0,1,2,3,4") return "Mon–Fri";
  if (nums.length === 7) return "Every day";
  return nums.map((n) => DAY_LABELS[n] ?? n).join(", ");
}

function ProfileRow({
  profile,
  users,
  onSave,
}: {
  profile: { id: string; user_id: string; user_name: string | null; manager_id: string | null };
  users: User[];
  onSave: (userId: string, manager_id: string | null) => void;
}) {
  const [managerId, setManagerId] = useState(profile.manager_id ?? "__none__");
  return (
    <div className="flex items-center justify-between border rounded p-3 text-sm gap-3">
      <span className="font-medium">{profile.user_name}</span>
      <div className="flex items-center gap-2">
        <Label className="sr-only">Manager</Label>
        <Select value={managerId} onValueChange={(v) => setManagerId(v ?? "__none__")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Manager" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No manager</SelectItem>
            {users
              .filter((u) => u.role === "sales_manager" || u.role === "admin")
              .map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.full_name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={() =>
            onSave(profile.user_id, managerId === "__none__" ? null : managerId)
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}
