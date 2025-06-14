
export interface SubscriptionPlan {
  id: string;
  plan_type: 'monthly' | 'yearly';
  name: string;
  price_usd: number;
  duration_days: number;
  features: {
    routines_limit: number;
    nutrition_photos_weekly: number;
    ai_chat_messages_weekly: number;
  };
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'trial';
  started_at: string;
  expires_at?: string;
  store_transaction_id?: string;
  store_platform?: string;
  auto_renewal: boolean;
  next_plan_type?: 'free' | 'monthly' | 'yearly';
  next_plan_starts_at?: string;
  scheduled_change_created_at?: string;
}
