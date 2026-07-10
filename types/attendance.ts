export type AttendanceSessionStatus = "clocked_in" | "on_break" | "clocked_out";
export type BreakType = "short" | "lunch" | "other";
export type CorrectionStatus = "pending" | "approved" | "rejected";
export type LeaveType = "paid" | "sick" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";
export type HalfDayPeriod = "morning" | "afternoon";

export interface BreakRecord {
  id: string;
  break_type: BreakType;
  start_at: string;
  end_at: string | null;
  duration_minutes: number | null;
}

export interface AttendanceSession {
  id: string;
  work_date: string;
  status: AttendanceSessionStatus;
  clock_in_at: string;
  clock_out_at: string | null;
  total_break_minutes: number;
  shift_warning: boolean;
  breaks: BreakRecord[];
}

export interface TodayAttendance {
  session: AttendanceSession | null;
  shift_warning: boolean;
  shift_name: string | null;
  shift_start_time: string | null;
  shift_end_time: string | null;
  elapsed_work_minutes: number;
  elapsed_break_minutes: number;
  active_break: BreakRecord | null;
  lunch_breaks_taken: number;
  lunch_break_minutes: number;
  short_break_minutes: number;
}

export interface CalendarDayEntry {
  date: string;
  session: AttendanceSession | null;
  on_leave: boolean;
  leave_type: LeaveType | null;
  is_half_day: boolean;
  has_missing_clock_out: boolean;
}

export interface CalendarResponse {
  month: string;
  days: CalendarDayEntry[];
}

export interface DaySessionDetail {
  id: string;
  clock_in_at: string;
  clock_out_at: string | null;
  status: AttendanceSessionStatus;
  breaks: BreakRecord[];
  work_minutes: number;
  break_minutes: number;
  missing_clock_out: boolean;
  pending_correction_id: string | null;
}

export interface DayAttendanceDetail {
  date: string;
  on_leave: boolean;
  leave_type: LeaveType | null;
  is_half_day: boolean;
  half_day_period: HalfDayPeriod | null;
  sessions: DaySessionDetail[];
  total_work_minutes: number;
  total_break_minutes: number;
  has_missing_clock_out: boolean;
}

export interface AttendanceCorrection {
  id: string;
  work_date: string;
  session_id: string | null;
  original_clock_in_at: string | null;
  original_clock_out_at: string | null;
  requested_clock_in_at: string | null;
  requested_clock_out_at: string | null;
  reason: string;
  status: CorrectionStatus;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  user_name?: string | null;
}

export interface LeaveBalance {
  leave_type: LeaveType;
  accrued: number;
  used: number;
  carried_forward: number;
  balance: number;
}

export interface LeaveApplication {
  id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  is_half_day: boolean;
  half_day_period: HalfDayPeriod | null;
  days_requested: number;
  reason: string;
  status: LeaveStatus;
  approver_id: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  user_id: string;
  user_name: string | null;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  days_of_week: string;
  lunch_break_minutes: number;
  short_break_minutes: number;
  short_break_limit: number;
  is_active: boolean;
}

export interface ShiftAssignment {
  id: string;
  user_id: string;
  shift_template_id: string;
  assignment_date: string;
  shift_template: ShiftTemplate | null;
  user_name: string | null;
}

export interface ShiftAssignmentBulkResponse {
  user_id: string;
  shift_template_id: string;
  start_date: string;
  end_date: string;
  days_assigned: number;
}

export interface ShiftAssignmentSummary {
  user_id: string;
  user_name: string | null;
  shift_template_id: string;
  shift_name: string | null;
  start_date: string;
  end_date: string;
  days_count: number;
}

export interface LeavePolicy {
  id: string;
  leave_type: LeaveType;
  accrual_per_month: number;
  is_active: boolean;
}

export interface UserAttendanceProfile {
  id: string;
  user_id: string;
  manager_id: string | null;
  timezone_override: string | null;
  attendance_enabled: boolean;
  user_name: string | null;
  manager_name: string | null;
}

export interface TeamAttendanceSummary {
  user_id: string;
  user_name: string;
  role: string;
  today_status: AttendanceSessionStatus | null;
  clock_in_at: string | null;
  on_leave: boolean;
  today_leave_status: LeaveStatus | null;
  today_leave_type: LeaveType | null;
  today_is_half_day: boolean;
  today_half_day_period: HalfDayPeriod | null;
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  paid: "Paid Leave",
  sick: "Sick Leave",
  unpaid: "Unpaid Leave",
};

export const BREAK_TYPE_LABELS: Record<BreakType, string> = {
  short: "Short Break",
  lunch: "Lunch Break",
  other: "Other Break",
};

export const STATUS_LABELS: Record<AttendanceSessionStatus, string> = {
  clocked_in: "Working",
  on_break: "On Break",
  clocked_out: "Clocked Out",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const HALF_DAY_PERIOD_LABELS: Record<HalfDayPeriod, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
};
