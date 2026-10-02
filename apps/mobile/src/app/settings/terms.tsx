import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="px-4 py-4 border-b border-surface-200 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-4 p-2 bg-surface-100 rounded-full">
          <ChevronLeft size={24} color="#3f3f46" />
        </Pressable>
        <Text className="text-xl font-bold text-surface-900">Terms of Service</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-black text-surface-900 mb-2">Terms and Conditions</Text>
        <Text className="text-sm text-surface-500 mb-6">Last Updated: September 2026</Text>

        <Text className="text-lg font-bold text-surface-900 mb-2">1. Acceptance of Terms</Text>
        <Text className="text-base text-surface-600 leading-relaxed mb-6">
          By accessing and using Nestara Estates, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our application.
        </Text>

        <Text className="text-lg font-bold text-surface-900 mb-2">2. User Accounts</Text>
        <Text className="text-base text-surface-600 leading-relaxed mb-6">
          To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information.
        </Text>

        <Text className="text-lg font-bold text-surface-900 mb-2">3. Property Listings (UGC)</Text>
        <Text className="text-base text-surface-600 leading-relaxed mb-6">
          Users may post property listings ("User Generated Content"). You retain ownership of your content, but grant us a license to display it. We reserve the right to remove or modify any listing that violates our policies, contains inappropriate content, or is deemed fraudulent.
        </Text>

        <Text className="text-lg font-bold text-surface-900 mb-2">4. User Conduct</Text>
        <Text className="text-base text-surface-600 leading-relaxed mb-6">
          You agree not to use the app for any unlawful purpose, to spam or harass other users, or to upload malicious code. Any abuse of the chat system or listing platform will result in immediate account termination.
        </Text>

        <Text className="text-lg font-bold text-surface-900 mb-2">5. Liability Disclaimer</Text>
        <Text className="text-base text-surface-600 leading-relaxed mb-6">
          Nestara Estates acts solely as a platform connecting buyers and sellers. We do not verify the complete accuracy of every listing and are not liable for any real estate transactions, financial losses, or disputes between users.
        </Text>
        
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
