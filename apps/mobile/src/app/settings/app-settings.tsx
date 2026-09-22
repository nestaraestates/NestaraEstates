import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Moon, Globe, Bell } from 'lucide-react-native';

export default function AppSettingsScreen() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <View className="flex-row items-center p-4 border-b border-zinc-200 bg-white">
        <Pressable onPress={() => router.push('/settings' as any)} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} className="mr-3 p-1">
          <ChevronLeft size={24} color="#18181b" />
        </Pressable>
        <Text className="text-xl font-bold text-zinc-900">App Settings</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-6">
        
        <Text className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-2">Notifications</Text>
        <View className="bg-white rounded-2xl overflow-hidden border border-zinc-200 mb-6">
          <View className="flex-row items-center justify-between p-4 border-b border-zinc-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-amber-50 rounded-full items-center justify-center mr-3">
                <Bell size={16} color="#d97706" />
              </View>
              <Text className="text-base font-semibold text-zinc-900">Push Notifications</Text>
            </View>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#e4e4e7', true: '#f59e0b' }} />
          </View>
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-3">
                <Globe size={16} color="#2563eb" />
              </View>
              <Text className="text-base font-semibold text-zinc-900">Email Alerts</Text>
            </View>
            <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ false: '#e4e4e7', true: '#f59e0b' }} />
          </View>
        </View>

        <Text className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-2">Appearance</Text>
        <View className="bg-white rounded-2xl overflow-hidden border border-zinc-200 mb-6">
          <View className="flex-row items-center justify-between p-4 opacity-50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-zinc-100 rounded-full items-center justify-center mr-3">
                <Moon size={16} color="#52525b" />
              </View>
              <Text className="text-base font-semibold text-zinc-900">Dark Mode</Text>
            </View>
            <Text className="text-xs text-zinc-400 font-bold">COMING SOON</Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-2">Language</Text>
        <View className="bg-white rounded-2xl overflow-hidden border border-zinc-200 mb-6">
          <View className="flex-row items-center justify-between p-4">
            <Text className="text-base font-semibold text-zinc-900">English (US)</Text>
            <Text className="text-amber-600 font-bold">Selected</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
