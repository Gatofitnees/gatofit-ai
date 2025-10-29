-- Add payment_failed_at column to user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMP WITH TIME ZONE;

-- Create index for performance on payment_failed status queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_failed 
ON user_subscriptions(status, payment_failed_at) 
WHERE status = 'payment_failed';

-- Add comment to document the column purpose
COMMENT ON COLUMN user_subscriptions.payment_failed_at IS 'Timestamp when the payment failure occurred. Used to track when the grace period started.';