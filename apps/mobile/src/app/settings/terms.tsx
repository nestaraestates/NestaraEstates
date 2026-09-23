import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-zinc-200">
        <Pressable onPress={() => { if(router.canGoBack()) router.back(); else router.push('/settings' as any); }} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} className="mr-3 p-1">
          <ChevronLeft size={24} color="#18181b" />
        </Pressable>
        <Text className="text-xl font-bold text-zinc-900">Terms of Service</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <Text className="text-base text-zinc-600 mb-6 leading-6">
          Welcome to Nestara Estates. These terms and conditions outline the rules and regulations for the use of our mobile app and services.
        </Text>
        
        <Text className="text-lg font-bold text-zinc-900 mb-2">1. Acceptance of Terms</Text>
        <Text className="text-base text-zinc-600 mb-6 leading-6">
          By accessing this app, we assume you accept these terms and conditions. Do not continue to use Nestara Estates if you do not agree to all of the terms and conditions stated on this page.
        </Text>

        <Text className="text-lg font-bold text-zinc-900 mb-2">2. User Accounts</Text>
        <Text className="text-base text-zinc-600 mb-6 leading-6">
          When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the terms, which may result in immediate termination of your account on our service.
        </Text>

        <Text className="text-lg font-bold text-zinc-900 mb-2">3. Property Listings</Text>
        <Text className="text-base text-zinc-600 mb-6 leading-6">
          Users may list properties for sale or rent. You represent and warrant that any information you provide in connection with such listings is accurate and that you have the right to list the property.
        </Text>

        <Text className="text-lg font-bold text-zinc-900 mb-2">4. Limitation of Liability</Text>
        <Text className="text-base text-zinc-600 mb-10 leading-6">
          In no event shall Nestara Estates, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this app.
        </Text>
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
