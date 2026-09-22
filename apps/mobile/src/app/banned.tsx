import { View, Text, Pressable, Linking } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

export default function BannedScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-zinc-50 px-6">
      <View className="bg-red-50 p-6 rounded-full mb-6">
        <ShieldAlert size={64} color="#ef4444" />
      </View>
      <Text className="text-2xl font-bold text-zinc-900 mb-3 text-center">Account Disabled</Text>
      <Text className="text-base text-zinc-600 text-center mb-8">
        Your account has been banned or suspended. For more details, please contact the admin.
      </Text>
      
      <Pressable 
        onPress={() => Linking.openURL('mailto:nestaraestates@gmail.com')}
        className="w-full bg-red-600 py-4 rounded-xl items-center shadow-sm mb-4"
      >
        <Text className="text-white font-bold text-lg">Contact Admin</Text>
      </Pressable>

      <Pressable 
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/welcome' as any);
        }}
        className="py-4"
      >
        <Text className="text-zinc-500 font-semibold text-base">Sign Out</Text>
      </Pressable>
    </View>
  );
}
