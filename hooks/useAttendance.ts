import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AttendanceCorrection,
  AttendanceSession,
  BreakType,
  CalendarResponse,
  DayAttendanceDetail,
  TodayAttendance,
} from "@/types/attendance";

export function useTodayAttendance() {
  return useQuery<TodayAttendance>({
    queryKey: ["attendance", "today"],
    queryFn: () => api.get("/attendance/today").then((r) => r.data),
    refetchInterval: 30_000,
  });
}

export function useAttendanceCalendar(month: string) {
  return useQuery<CalendarResponse>({
    queryKey: ["attendance", "calendar", month],
    queryFn: () => api.get("/attendance/calendar", { params: { month } }).then((r) => r.data),
    enabled: !!month,
  });
}

export function useDayAttendance(date: string | null) {
  return useQuery<DayAttendanceDetail>({
    queryKey: ["attendance", "day", date],
    queryFn: () => api.get("/attendance/day", { params: { date } }).then((r) => r.data),
    enabled: !!date,
  });
}

export function useAttendanceSessions(page = 1) {
  return useQuery<{ items: AttendanceSession[]; total: number }>({
    queryKey: ["attendance", "sessions", page],
    queryFn: () =>
      api.get("/attendance/sessions", { params: { page, page_size: 20 } }).then((r) => r.data),
  });
}

export function useCorrections() {
  return useQuery<AttendanceCorrection[]>({
    queryKey: ["attendance", "corrections"],
    queryFn: () => api.get("/attendance/corrections").then((r) => r.data),
  });
}

export function useClockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/attendance/clock-in").then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useClockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/attendance/clock-out").then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useStartBreak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (break_type: BreakType) =>
      api.post("/attendance/break/start", { break_type }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useEndBreak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/attendance/break/end").then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useSubmitCorrection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      work_date: string;
      session_id?: string;
      requested_clock_in_at?: string;
      requested_clock_out_at?: string;
      reason: string;
    }) => api.post("/attendance/corrections", payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}
