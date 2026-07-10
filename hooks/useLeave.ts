import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { HalfDayPeriod, LeaveApplication, LeaveBalance, LeaveType } from "@/types/attendance";

export function useLeaveBalances() {
  return useQuery<LeaveBalance[]>({
    queryKey: ["leave", "balances"],
    queryFn: () => api.get("/leave/balances").then((r) => r.data),
  });
}

export function useLeaveApplications(status?: string) {
  return useQuery<LeaveApplication[]>({
    queryKey: ["leave", "applications", status],
    queryFn: () =>
      api.get("/leave/applications", { params: status ? { status } : {} }).then((r) => r.data),
  });
}

export function usePendingLeaveApplications() {
  return useQuery<LeaveApplication[]>({
    queryKey: ["leave", "applications", "pending-approval"],
    queryFn: () => api.get("/leave/applications/pending").then((r) => r.data),
  });
}

export function useApplyLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      leave_type: LeaveType;
      start_date: string;
      end_date: string;
      is_half_day?: boolean;
      half_day_period?: HalfDayPeriod;
      reason: string;
    }) => api.post("/leave/applications", payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leave"] });
    },
  });
}

export function useCancelLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/leave/applications/${id}/cancel`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leave"] });
    },
  });
}

export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/leave/applications/${id}/approve`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leave"] });
    },
  });
}

export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejection_reason }: { id: string; rejection_reason: string }) =>
      api.patch(`/leave/applications/${id}/reject`, { rejection_reason }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leave"] });
    },
  });
}
