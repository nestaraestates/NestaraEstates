import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function TermsAndConditionsPage() {
 return (
 <SafeAreaView className="flex-1 bg-slate-50" edges={['bottom']}>
 <Stack.Screen options={{ title: 'Terms & Conditions', headerBackTitle: 'Back' }} />
 <ScrollView className="flex-1 px-4 py-6">
 <Text className="text-3xl font-bold mb-6 text-slate-900 mt-2">Terms and Conditions</Text>
 
 <View className="mb-12">
 <Text className="text-base text-slate-600 mb-6">
 Welcome to Nestara Estates. These terms and conditions outline the rules and regulations for the use of our website and services.
 </Text>

 <View className="mb-6">
 <Text className="text-xl font-semibold text-slate-900 mb-2">1. Acceptance of Terms</Text>
 <Text className="text-base text-slate-600 leading-relaxed">
 By accessing this application, we assume you accept these terms and conditions. Do not continue to use Nestara Estates if you do not agree to all of the terms and conditions stated on this page.
 </Text>
 </View>

 <View className="mb-6">
 <Text className="text-xl font-semibold text-slate-900 mb-2">2. User Accounts</Text>
 <Text className="text-base text-slate-600 leading-relaxed">
 When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the terms, which may result in immediate termination of your account on our service.
 </Text>
 </View>

 <View className="mb-6">
 <Text className="text-xl font-semibold text-slate-900 mb-2">3. Property Listings</Text>
 <Text className="text-base text-slate-600 leading-relaxed">
 Users may list properties for sale or rent. You represent and warrant that any information you provide in connection with such listings is accurate and that you have the right to list the property.
 </Text>
 </View>

 <View className="mb-6">
 <Text className="text-xl font-semibold text-slate-900 mb-2">4. Limitation of Liability</Text>
 <Text className="text-base text-slate-600 leading-relaxed">
 In no event shall Nestara Estates, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this application.
 </Text>
 </View>
 </View>
 </ScrollView>
 </SafeAreaView>
 );
}
