import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AttendanceCorrection,
  CorrectionStatus,
  LeavePolicy,
  ShiftAssignment,
  ShiftAssignmentSummary,
  ShiftTemplate,
  TeamAttendanceSummary,
  UserAttendanceProfile,
} from "@/types/attendance";

export function useShiftTemplates() {
  return useQuery<ShiftTemplate[]>({
    queryKey: ["attendance-admin", "shift-templates"],
    queryFn: () => api.get("/attendance/admin/shifts/templates").then((r) => r.data),
  });
}

export function useShiftAssignmentSummary() {
  return useQuery<ShiftAssignmentSummary[]>({
    queryKey: ["attendance-admin", "shift-assignments-summary"],
    queryFn: () =>
      api.get("/attendance/admin/shifts/assignments/summary").then((r) => r.data),
  });
}

export function useShiftAssignments(userId?: string) {
  return useQuery<ShiftAssignment[]>({
    queryKey: ["attendance-admin", "shift-assignments", userId],
    queryFn: () =>
      api
        .get("/attendance/admin/shifts/assignments", {
          params: userId ? { user_id: userId } : {},
        })
        .then((r) => r.data),
  });
}

export function useLeavePolicies() {
  return useQuery<LeavePolicy[]>({
    queryKey: ["attendance-admin", "policies"],
    queryFn: () => api.get("/attendance/admin/policies").then((r) => r.data),
  });
}

export function useAttendanceProfiles() {
  return useQuery<UserAttendanceProfile[]>({
    queryKey: ["attendance-admin", "profiles"],
    queryFn: () => api.get("/attendance/admin/profiles").then((r) => r.data),
  });
}

export function useAdminCorrections(status?: CorrectionStatus) {
  return useQuery<AttendanceCorrection[]>({
    queryKey: ["attendance-admin", "corrections", status],
    queryFn: () =>
      api
        .get("/attendance/admin/corrections", {
          params: status ? { status } : {},
        })
        .then((r) => r.data),
  });
}

export function useTeamAttendance() {
  return useQuery<TeamAttendanceSummary[]>({
    queryKey: ["attendance-admin", "team"],
    queryFn: () => api.get("/attendance/admin/team").then((r) => r.data),
  });
}

export function useCreateShiftTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      start_time: string;
      end_time: string;
      days_of_week?: string;
      lunch_break_minutes?: number;
      short_break_minutes?: number;
    }) => api.post("/attendance/admin/shifts/templates", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance-admin"] }),
  });
}

export function useDeleteShiftTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      api.delete(`/attendance/admin/shifts/templates/${templateId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-admin"] });
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useDeleteShiftAssignmentRange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      user_id: string;
      shift_template_id: string;
      start_date: string;
      end_date: string;
    }) =>
      api
        .delete("/attendance/admin/shifts/assignments/bulk", { params: payload })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-admin"] });
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useCreateShiftAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      user_id: string;
      shift_template_id: string;
      start_date?: string;
      end_date?: string;
    }) => api.post("/attendance/admin/shifts/assignments", payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-admin"] });
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useCreateLeavePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { leave_type: string; accrual_per_month: number }) =>
      api.post("/attendance/admin/policies", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance-admin"] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      ...payload
    }: {
      userId: string;
      manager_id?: string | null;
      timezone_override?: string | null;
      attendance_enabled?: boolean;
    }) =>
      api.patch(`/attendance/admin/profiles/${userId}`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance-admin"] }),
  });
}

export function useReviewCorrection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      reviewer_notes,
    }: {
      id: string;
      status: CorrectionStatus;
      reviewer_notes?: string;
    }) =>
      api
        .patch(`/attendance/admin/corrections/${id}`, { status, reviewer_notes })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-admin"] });
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useRunAccrual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/attendance/admin/accrue").then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leave"] }),
  });
}
