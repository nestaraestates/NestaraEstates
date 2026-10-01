import "react-native-css-interop";
import "../global.css";
import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import { NetworkBanner } from '@/components/NetworkBanner';
import { PermissionsPopup } from "@/components/PermissionsPopup";


import { useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

function RealtimeBanListener() {
  useEffect(() => {
    let interval: any;

    const startPolling = async (userId: string) => {
      if (interval) clearInterval(interval);
      if (!userId) return;

      // Poll every 10 seconds since Supabase Realtime might not be enabled on the profiles table
      interval = setInterval(async () => {
        const { data } = await supabase.from('profiles').select('account_status').eq('id', userId).single();
        if (data && (data.account_status === 'BANNED' || data.account_status === 'SUSPENDED')) {
          router.replace('/banned' as any);
        }
      }, 10000);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) startPolling(session.user.id);
    }).catch(console.error);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) startPolling(session.user.id);
    });

    return () => {
      if (interval) clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  return null;
}

export default function RootLayout() {

 return (
  <View style={{ flex: 1 }}>
    <NetworkBanner />
      <PermissionsPopup />
    <RealtimeBanListener />
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  </View>
 );
}
