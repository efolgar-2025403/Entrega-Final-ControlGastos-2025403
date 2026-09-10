export interface Income {

  id: string;

  amount: number;

  description: string | null;

  date: string;

  category_id: string;

  created_at: string;

  updated_at: string;

}

export interface CreateIncomeInput {

  amount: number;

  description?: string | null;

  date: string;

  category_id: string;

}

export interface UpdateIncomeInput {

  amount: number;

  description?: string | null;

  date: string;

  category_id: string;

}