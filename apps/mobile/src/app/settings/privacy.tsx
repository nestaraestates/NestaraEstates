import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-zinc-200">
        <Pressable onPress={() => { if(router.canGoBack()) router.back(); else router.push('/settings' as any); }} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} className="mr-3 p-1">
          <ChevronLeft size={24} color="#18181b" />
        </Pressable>
        <Text className="text-xl font-bold text-zinc-900">Privacy Policy</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <Text className="text-base text-zinc-600 mb-6 leading-6">
          At Nestara Estates, accessible from our mobile app and website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Nestara Estates and how we use it.
        </Text>
        
        <Text className="text-lg font-bold text-zinc-900 mb-2">Information we collect</Text>
        <Text className="text-base text-zinc-600 mb-6 leading-6">
          The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information. If you contact us directly, we may receive additional information about you such as your name, email address, phone number, and the contents of the message.
        </Text>

        <Text className="text-lg font-bold text-zinc-900 mb-2">How we use your information</Text>
        <Text className="text-base text-zinc-600 mb-6 leading-6">
          We use the information we collect in various ways, including to:
          {'\n'}• Provide, operate, and maintain our app
          {'\n'}• Improve, personalize, and expand our app
          {'\n'}• Understand and analyze how you use our app
          {'\n'}• Develop new products, services, features, and functionality
        </Text>

        <Text className="text-lg font-bold text-zinc-900 mb-2">Location Data</Text>
        <Text className="text-base text-zinc-600 mb-10 leading-6">
          We explicitly hide exact map pins from standard users to protect seller privacy. Only verified admins and property owners can view exact GPS coordinates.
        </Text>
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
