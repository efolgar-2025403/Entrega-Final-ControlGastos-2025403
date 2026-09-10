export interface Expense {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseInput {
  amount: number;
  description?: string | null;
  date: string;
  category_id: string;
}

export interface UpdateExpenseInput {
  amount: number;
  description?: string | null;
  date: string;
  category_id: string;
}