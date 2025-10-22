-- Add 'suspended' to subscription_status enum type
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'suspended';

-- Add suspended_at column to track when subscription was suspended
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;