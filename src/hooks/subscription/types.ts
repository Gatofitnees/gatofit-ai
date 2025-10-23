
export interface SubscriptionPlan {
  id: string;
  plan_type: 'monthly' | 'yearly' | 'test_daily';
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
  plan_type: 'free' | 'monthly' | 'yearly' | 'asesorados' | 'test_daily';
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'trial' | 'suspended' | 'payment_failed';
  started_at: string;
  expires_at?: string;
  store_transaction_id?: string;
  store_platform?: string;
  auto_renewal: boolean;
  next_plan_type?: 'free' | 'monthly' | 'yearly' | 'asesorados' | 'test_daily';
  next_plan_starts_at?: string;
  scheduled_change_created_at?: string;
  discount_code_id?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  paypal_subscription_id?: string;
  suspended_at?: string;
  payment_failed_at?: string;
}

export interface PaymentFailure {
  id: string;
  subscription_id: string;
  user_id: string;
  failed_at: string;
  failure_reason?: string;
  retry_count: number;
  last_retry_at?: string;
  resolved_at?: string;
  grace_period_ends_at: string;
  created_at: string;
}

export interface CancelScheduledChangeResult {
  success: boolean;
  paypalSubscriptionId?: string;
  cancelledPlanType?: string;
}
