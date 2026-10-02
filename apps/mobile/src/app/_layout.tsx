import "react-native-css-interop";
import "../global.css";
import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NetworkBanner } from '@/components/NetworkBanner';
import { PermissionsPopup } from "@/components/PermissionsPopup";

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});



import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import { registerForPushNotificationsAsync } from '@/utils/pushNotifications';

function RealtimeBanListener() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    let currentUserId: string | null = null;

    const checkBanStatus = async () => {
      if (!currentUserId) return;
      try {
        const { data } = await supabase.from('profiles').select('account_status').eq('id', currentUserId).single();
        if (data && (data.account_status === 'BANNED' || data.account_status === 'SUSPENDED')) {
          router.replace('/banned' as any);
        }
      } catch (err) {
        console.error(err);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        currentUserId = session.user.id;
        checkBanStatus();
        registerForPushNotificationsAsync();
        // Ensure push token is synced on login
        registerForPushNotificationsAsync();
      }
    }).catch(console.error);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        currentUserId = session.user.id;
        checkBanStatus();
      } else {
        currentUserId = null;
      }
    });

    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkBanStatus();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  return null;
}

export default function RootLayout() {

 return (
  <View style={{ flex: 1 }}>
    <StatusBar style="dark" />
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
