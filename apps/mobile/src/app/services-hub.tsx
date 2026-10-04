import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Briefcase, Hammer, LayoutDashboard, ChevronRight, UserPlus } from 'lucide-react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function ServicesHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkProStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsPro(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('professional_profiles')
          .select('id')
          .eq('id', user.id)
          .single();
          
        if (data && !error) {
          setIsPro(true);
        } else {
          setIsPro(false);
        }
      } catch (e) {
        setIsPro(false);
      }
    }
    
    checkProStatus();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}> 
      <Stack.Screen options={{ title: 'Nestara Services', headerTitleStyle: { fontWeight: 'bold' } }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        <View className="flex-row items-center mb-4">
          <Text className="text-2xl font-bold text-zinc-900">Professional Services</Text>
          <View className="bg-amber-500 px-2 py-0.5 rounded ml-2">
            <Text className="text-white text-xs font-bold uppercase">NEW</Text>
          </View>
        </View>
        <Text className="text-zinc-600 mb-8">Whether you are looking to hire, build, or manage your business, select an option below.</Text>

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

        {/* 3. Join Pro / Pro Dashboard (Dynamic) */}
        {isPro === null ? (
          <View className="p-6 items-center justify-center mt-4 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-sm">
            <ActivityIndicator size="small" color="#f59e0b" />
          </View>
        ) : isPro ? (
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
        ) : (
          <Pressable 
            onPress={() => router.push('/join-professional' as any)}
            className="bg-brand-600 rounded-2xl p-6 shadow-sm flex-row items-center mt-4"
          >
            <View className="w-14 h-14 bg-brand-700 rounded-xl items-center justify-center mr-4">
              <UserPlus size={28} color="#FFF" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white mb-1">Join as a Pro</Text>
              <Text className="text-sm text-brand-100">Register to get leads and manage your professional portfolio.</Text>
            </View>
            <ChevronRight size={20} color="#FFF" className="ml-2" />
          </Pressable>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
