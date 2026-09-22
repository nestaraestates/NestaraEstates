import "../global.css";
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { NetworkBanner } from '@/components/NetworkBanner';

export default function RootLayout() {
 return (
  <View style={{ flex: 1 }}>
    <NetworkBanner />
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  </View>
 );
}
