import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Target, Eye, ShieldCheck, Users, TrendingUp } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function AboutPage() {
 return (
 <SafeAreaView className="flex-1 bg-slate-50" edges={['bottom']}>
 <Stack.Screen options={{ title: 'About Us', headerBackTitle: 'Back' }} />
 <ScrollView className="flex-1 px-4 py-6">
 <View className="mb-8 items-center mt-2">
 <Text className="text-3xl font-black text-slate-900 text-center">
 About <Text className="text-blue-500">Nestara Estates</Text>
 </Text>
 <Text className="text-base text-slate-600 text-center mt-4">
 We are building a modern, technology-driven real-estate platform focused on making property buying, selling, renting, and verification simpler, safer, and more transparent.
 </Text>
 </View>

 <View className="mb-10">
 <View className="bg-white rounded-2xl p-6 border border-slate-200 mb-4">
 <View className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
 <Target color="#2563EB" size={24} />
 </View>
 <Text className="text-xl font-bold mb-2 text-slate-900">Our Mission</Text>
 <Text className="text-slate-600 leading-relaxed">
 To make property discovery, transactions, and verification more transparent, convenient, and technology-driven. We believe that finding your dream home or next investment should be an exciting journey, not a stressful ordeal.
 </Text>
 </View>

 <View className="bg-white rounded-2xl p-6 border border-slate-200">
 <View className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
 <Eye color="#D97706" size={24} />
 </View>
 <Text className="text-xl font-bold mb-2 text-slate-900">Our Vision</Text>
 <Text className="text-slate-600 leading-relaxed">
 To become the most trusted property-tech platform connecting all stakeholders—buyers, sellers, tenants, and verified dealers. We envision a future where every real estate transaction is backed by verified data and seamless digital experiences.
 </Text>
 </View>
 </View>

 <View className="mb-12">
 <Text className="text-2xl font-bold text-center mb-6 text-slate-900">Why Nestara Was Created</Text>
 
 <View>
 <View className="items-center mb-6">
 <View className="bg-emerald-50 w-14 h-14 flex items-center justify-center rounded-full mb-3">
 <ShieldCheck color="#059669" size={28} />
 </View>
 <Text className="text-lg font-bold mb-1 text-slate-900">Trust & Transparency</Text>
 <Text className="text-slate-600 text-center text-sm">Every property undergoes strict verification to ensure you get exactly what you see.</Text>
 </View>

 <View className="items-center mb-6">
 <View className="bg-purple-50 w-14 h-14 flex items-center justify-center rounded-full mb-3">
 <TrendingUp color="#7C3AED" size={28} />
 </View>
 <Text className="text-lg font-bold mb-1 text-slate-900">Technology First</Text>
 <Text className="text-slate-600 text-center text-sm">Advanced search, smart calculators, and digital processes make real estate faster.</Text>
 </View>

 <View className="items-center mb-6">
 <View className="bg-blue-50 w-14 h-14 flex items-center justify-center rounded-full mb-3">
 <Users color="#2563EB" size={28} />
 </View>
 <Text className="text-lg font-bold mb-1 text-slate-900">Convenience</Text>
 <Text className="text-slate-600 text-center text-sm">Discovery, comparison, verification, and communication—all in one single platform.</Text>
 </View>
 </View>
 </View>
 </ScrollView>
 </SafeAreaView>
 );
}
