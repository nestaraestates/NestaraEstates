import "../global.css";
import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import { NetworkBanner } from '@/components/NetworkBanner';


import { useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

function RealtimeBanListener() {
  useEffect(() => {
    let channel;

    const setupListener = async (userId) => {
      if (channel) supabase.removeChannel(channel);
      if (!userId) return;

      channel = supabase
        .channel('user_status_changes')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${userId}`
        }, (payload) => {
          const status = payload.new.account_status;
          if (status === 'BANNED' || status === 'SUSPENDED') {
            router.replace('/banned' as any);
          }
        })
        .subscribe();
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setupListener(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setupListener(session?.user?.id);
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
      subscription.unsubscribe();
    };
  }, []);

  return null;
}

export default function RootLayout() {

 return (
  <View style={{ flex: 1 }}>
    <NetworkBanner />
    <RealtimeBanListener />
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  </View>
 );
}
