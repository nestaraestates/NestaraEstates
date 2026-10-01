import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="px-4 py-4 border-b border-zinc-200 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-4 p-2 bg-zinc-100 rounded-full">
          <ChevronLeft size={24} color="#3f3f46" />
        </Pressable>
        <Text className="text-xl font-bold text-zinc-900">Privacy Policy</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-black text-zinc-900 mb-2">Privacy Policy</Text>
        <Text className="text-sm text-zinc-500 mb-6">Last Updated: September 2026</Text>

        <Text className="text-lg font-bold text-zinc-900 mb-2">1. Data We Collect</Text>
        <Text className="text-base text-zinc-600 leading-relaxed mb-6">
          We collect information you provide directly to us, including your name, email address, phone number, and physical address when you register. When listing properties, we collect location data, images, and property details.
        </Text>

        <Text className="text-lg font-bold text-zinc-900 mb-2">2. How We Use Your Data</Text>
        <Text className="text-base text-zinc-600 leading-relaxed mb-6">
          We use this data to provide and improve the Nestara Estates platform, facilitate communication between buyers and sellers, send you push notifications, and verify the authenticity of listings.
        </Text>

        <Text className="text-lg font-bold text-zinc-900 mb-2">3. Data Sharing</Text>
        <Text className="text-base text-zinc-600 leading-relaxed mb-6">
          We do not sell your personal data. Your contact information is only shared with verified admins or users when you explicitly consent to contact them regarding a property enquiry.
        </Text>

        <Text className="text-lg font-bold text-zinc-900 mb-2">4. Data Deletion</Text>
        <Text className="text-base text-zinc-600 leading-relaxed mb-6">
          You have the right to request the deletion of your personal data. You can delete your account and all associated data directly from the "Settings" tab in this app.
        </Text>
        
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
