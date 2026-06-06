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
  new: "bg-stage-new text-stage-new-foreground",
  contacted: "bg-stage-contacted text-stage-contacted-foreground",
  qualified: "bg-stage-qualified text-stage-qualified-foreground",
  proposal: "bg-stage-proposal text-stage-proposal-foreground",
  negotiation: "bg-stage-negotiation text-stage-negotiation-foreground",
  won: "bg-stage-won text-stage-won-foreground",
  lost: "bg-stage-lost text-stage-lost-foreground",
};

export const PRIORITY_COLORS: Record<LeadPriority, string> = {
  low: "bg-priority-low text-priority-low-foreground",
  medium: "bg-priority-medium text-priority-medium-foreground",
  high: "bg-priority-high text-priority-high-foreground",
};
