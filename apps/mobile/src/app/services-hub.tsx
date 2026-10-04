import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Briefcase, Hammer, LayoutDashboard, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ServicesHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-zinc-50">
      <Stack.Screen options={{ title: 'Nestara Services', headerTitleStyle: { fontWeight: 'bold' } }} />
      
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        <Text className="text-2xl font-bold text-zinc-900 mb-2">Professional Services</Text>
        <Text className="text-zinc-500 mb-8">Whether you are looking to hire, build, or manage your business, select an option below.</Text>

        {/* 1. Hire a Pro */}
        <Pressable 
          onPress={() => router.push('/professionals' as any)}
          className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-zinc-200 flex-row items-center"
        >
          <View className="w-14 h-14 bg-brand-50 rounded-xl items-center justify-center mr-4">
            <Briefcase size={28} color="#0284c7" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-zinc-900 mb-1">Hire a Professional</Text>
            <Text className="text-sm text-zinc-500">Browse verified architects, interior designers, and contractors directly.</Text>
          </View>
          <ChevronRight size={20} color="#D4D4D8" className="ml-2" />
        </Pressable>

        {/* 2. Build Your Home */}
        <Pressable 
          onPress={() => router.push('/build-your-home' as any)}
          className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-zinc-200 flex-row items-center"
        >
          <View className="w-14 h-14 bg-amber-50 rounded-xl items-center justify-center mr-4">
            <Hammer size={28} color="#f59e0b" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-zinc-900 mb-1">Build Your Home</Text>
            <Text className="text-sm text-zinc-500">Post your project requirements and get quotes from multiple pros.</Text>
          </View>
          <ChevronRight size={20} color="#D4D4D8" className="ml-2" />
        </Pressable>

        {/* 3. Pro Dashboard */}
        <Pressable 
          onPress={() => router.push('/dashboard/professional' as any)}
          className="bg-zinc-900 rounded-2xl p-6 shadow-sm flex-row items-center mt-4"
        >
          <View className="w-14 h-14 bg-zinc-800 rounded-xl items-center justify-center mr-4">
            <LayoutDashboard size={28} color="#FFF" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white mb-1">Pro Dashboard</Text>
            <Text className="text-sm text-zinc-400">Manage your active leads, quotes, and external links. (Pros Only)</Text>
          </View>
          <ChevronRight size={20} color="#52525B" className="ml-2" />
        </Pressable>

      </ScrollView>
    </View>
  );
}
