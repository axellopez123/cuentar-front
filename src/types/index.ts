export type UserRole = 'primary' | 'partner' | 'member';
export type CardType = 'credit' | 'debit';
export type TransactionType = 'expense' | 'payment' | 'adjustment';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface BillingCycleInfo {
  next_closing_date: string;
  days_until_closing: number;
  next_due_date: string;
  days_until_due: number;
  is_due_imminent: boolean;
}

export interface CardBudgetInfo {
  monthly_budget_limit: string;
  spent_this_period: string;
  remaining_budget: string;
  usage_percentage: number;
  is_exceeded: boolean;
}

export interface CardCreditInfo {
  credit_limit: string;
  spent_this_period: string;
  available_credit: string;
  utilization_percentage: number;
}

export interface CardStatus {
  card_id: string;
  alias: string;
  card_type: CardType;
  currency: string;
  current_balance: string;
  spent_this_period: string;
  billing_cycle?: BillingCycleInfo | null;
  budget?: CardBudgetInfo | null;
  credit?: CardCreditInfo | null;
}

export interface Card {
  id: string;
  user_id: string;
  alias: string;
  card_type: CardType;
  currency: string;
  credit_limit: string;
  current_balance: string;
  spent_this_period: string;
  monthly_budget_limit?: string | null;
  statement_closing_day?: number | null;
  payment_due_day?: number | null;
  color_hex?: string;
  is_active: boolean;
  created_at: string;
  status?: CardStatus;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color_hex: string;
  is_default: boolean;
  created_at: string;
}

export interface InstallmentPlan {
  id: string;
  transaction_id: string;
  card_id: string;
  total_amount: string;
  monthly_amount: string;
  total_installments: number;
  remaining_installments: number;
  start_date: string;
  is_active: boolean;
}

export interface Attachment {
  id: string;
  transaction_id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  card_id: string;
  user_id: string;
  category_id?: string | null;
  type: TransactionType;
  amount: string;
  description: string;
  transaction_date: string;
  is_shared: boolean;
  shared_split_ratio: string;
  is_installment: boolean;
  created_at: string;
  card_alias?: string;
  user_name?: string;
  category_name?: string;
  installment_plan?: InstallmentPlan | null;
  attachments?: Attachment[];
}

export interface UpcomingPaymentItem {
  card_id: string;
  alias: string;
  owner_name: string;
  amount_to_pay: string;
  payment_due_date: string;
  days_until_due: number;
  is_due_imminent: boolean;
}

export interface ParticipantBreakdownItem {
  user_id: string;
  full_name: string;
  role: string;
  total_spent: string;
  shared_spent: string;
  personal_spent: string;
  percentage_of_total: number;
}

export interface DashboardTotals {
  total_credit_spent: string;
  total_credit_limit: string;
  total_debit_balance: string;
  total_period_expenses: string;
}

export interface DashboardResponse {
  period_month: string;
  totals: DashboardTotals;
  upcoming_payments: UpcomingPaymentItem[];
  participants_breakdown: ParticipantBreakdownItem[];
  cards_summary: CardStatus[];
}

