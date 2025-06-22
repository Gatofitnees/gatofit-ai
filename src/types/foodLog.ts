
import type { Json } from '@/integrations/supabase/types';

export interface FoodLogEntry {
  id?: number;
  food_item_id?: number;
  custom_food_name: string;
  photo_url?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack1' | 'snack2';
  quantity_consumed: number;
  unit_consumed: string;
  calories_consumed: number;
  protein_g_consumed: number;
  carbs_g_consumed: number;
  fat_g_consumed: number;
  health_score?: number;
  ingredients?: Array<{
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  notes?: string;
  logged_at: string;
  log_date: string;
}
