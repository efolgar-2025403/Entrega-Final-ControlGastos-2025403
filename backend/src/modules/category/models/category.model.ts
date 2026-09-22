export type CategoryType = 'expense' | 'income';

export interface Category {
  id: number;
  name: string;
  description: string | null;
  type: CategoryType;
  created_at: Date;
  updated_at: Date;
  user_id: number;
}