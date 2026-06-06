export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type LeadPriority = "low" | "medium" | "high";

export type LeadSource =
  | "website"
  | "referral"
  | "cold_call"
  | "social_media"
  | "email_campaign"
  | "trade_show"
  | "other";

export type ActivityType = "call" | "email" | "meeting" | "note" | "task";

export interface UserBrief {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface Lead {
  id: string;
  title: string;
  company_name: string | null;
  contact_name: string;
  email: string | null;
  phone: string | null;
  stage: LeadStage;
  priority: LeadPriority;
  source: LeadSource;
  value: number | null;
  notes: string | null;
  expected_close_date: string | null;
  assigned_to_id: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  assignee: UserBrief | null;
  creator: UserBrief | null;
}

export interface LeadListResponse {
  items: Lead[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LeadCreate {
  title: string;
  company_name?: string;
  contact_name: string;
  email?: string;
  phone?: string;
  stage?: LeadStage;
  priority?: LeadPriority;
  source?: LeadSource;
  value?: number;
  notes?: string;
  expected_close_date?: string;
  assigned_to_id?: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  user_id: string;
  type: ActivityType;
  description: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  user: UserBrief | null;
}

export const STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const STAGE_ORDER: LeadStage[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export const STAGE_COLORS: Record<LeadStage, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-purple-100 text-purple-700",
  proposal: "bg-orange-100 text-orange-700",
  negotiation: "bg-yellow-100 text-yellow-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

export const PRIORITY_COLORS: Record<LeadPriority, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-600",
};
