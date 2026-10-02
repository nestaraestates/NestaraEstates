import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';

// Configure how notifications should behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f59e0b',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification! Status: ' + finalStatus);
      Alert.alert("Permission Denied", "Could not get notification permissions. Please enable them in Android Settings -> Apps -> Nestara Estates.");
      return;
    }

    try {
      // Get the push token
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId || 'b78ec5e5-58ea-4b2a-9063-080548894cf1';
      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      token = tokenResponse.data;
      
      // Save token to Supabase profile
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id && token) {
        const { error } = await supabase
          .from('profiles')
          .update({ push_token: token })
          .eq('id', session.user.id);
        
        if (error) {
          Alert.alert("Supabase Error", "Failed to save push token to DB: " + error.message);
        } else {
          // Success! We can optionally alert here, but let's keep it silent if it works.
        }
      }
      
    } catch (e: any) {
      console.log("Error getting push token:", e);
      Alert.alert("Push Token Error", e?.message || "Failed to generate push token from Expo. Is FCM configured correctly?");
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
