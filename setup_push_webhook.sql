-- 1. Create a trigger function that sends a webhook to your Edge Function
-- (Replace YOUR_PROJECT_REF with your actual Supabase project reference ID)
-- This requires the pg_net extension to be enabled in your database.

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION trigger_send_push_notification()
RETURNS trigger AS $$
DECLARE
  webhook_url text := 'https://dthkkgkxjahydnsfpupg.supabase.co/functions/v1/send-push-notification';
BEGIN
  -- Send the new record as JSON to the Edge Function via pg_net
  PERFORM net.http_post(
    url := webhook_url,
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('request.jwt.claim.role', true) || '"}'::jsonb,
    body := json_build_object('record', row_to_json(NEW))::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger to fire on INSERTS to the notifications table
DROP TRIGGER IF EXISTS on_notification_insert ON public.notifications;
CREATE TRIGGER on_notification_insert
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION trigger_send_push_notification();
