-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule cron job to check expired grace periods every hour
SELECT cron.schedule(
  'check-expired-grace-periods',
  '0 * * * *',  -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://mwgnpexeymgpzibnkiof.supabase.co/functions/v1/check-expired-grace-periods',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z25wZXhleW1ncHppYm5raW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDMxMDAsImV4cCI6MjA2MjcxOTEwMH0.4MCeBc9YPSI4ASDcSLrz_25R70KmRBEfyEtqmsZ3GYY"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);