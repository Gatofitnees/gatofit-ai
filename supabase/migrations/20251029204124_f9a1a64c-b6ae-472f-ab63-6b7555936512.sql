-- Add payment_failed status to subscription_status enum
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'payment_failed';