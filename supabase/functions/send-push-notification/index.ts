import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    
    // Webhook payload typically has `record` for INSERT operations
    const notification = payload.record;
    
    if (!notification || !notification.user_id) {
      return new Response(JSON.stringify({ error: "No user_id found in payload" }), { status: 400 });
    }

    // Get the user's push token
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', notification.user_id)
      .single();

    if (error || !profile?.push_token) {
      console.log('No push token found for user', notification.user_id);
      return new Response(JSON.stringify({ message: "No push token found" }), { status: 200 });
    }

    // Send Expo push notification
    const expoPushUrl = 'https://exp.host/--/api/v2/push/send';
    
    const expoPayload = {
      to: profile.push_token,
      sound: 'default',
      title: notification.title || 'Nestara Estates',
      body: notification.content || 'You have a new notification.',
      data: { notificationId: notification.id },
    };

    const pushResponse = await fetch(expoPushUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expoPayload),
    });

    const pushResult = await pushResponse.json();
    console.log('Expo Push Result:', pushResult);

    return new Response(JSON.stringify({ success: true, result: pushResult }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (err: any) {
    console.error('Error in send-push-notification:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
