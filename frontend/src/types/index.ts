export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string | null;
}

export interface AuthResponse {
  user: User;
}

export interface Customer {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  industry: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AIInsight {
  id: number;
  summary: string;
  sentiment: string;
  action_items: string[];
  risks: string[];
  created_at: string;
}

export interface Interaction {
  id: number;
  customer_id: number;
  title: string;
  interaction_type: string;
  meeting_notes: string | null;
  meeting_date: string;
  created_at: string;
  ai_insight: AIInsight | null;
  customer_name: string | null;
}

export interface InteractionListResponse {
  items: Interaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MonthlyCount {
  month: string;
  count: number;
}

export interface SentimentCount {
  sentiment: string;
  count: number;
}

export interface DashboardMetrics {
  total_customers: number;
  total_interactions: number;
  positive_sentiments: number;
  neutral_sentiments: number;
  negative_sentiments: number;
  customer_growth: MonthlyCount[];
  interactions_per_month: MonthlyCount[];
  sentiment_distribution: SentimentCount[];
}
