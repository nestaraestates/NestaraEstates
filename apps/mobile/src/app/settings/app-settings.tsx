import { TouchableOpacity, Linking } from "react-native";
import { Mail, Link } from "lucide-react-native";
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { registerForPushNotificationsAsync } from '@/utils/pushNotifications';
import { Alert } from 'react-native';
import { ChevronLeft, Moon, Globe, Bell } from 'lucide-react-native';

import { useColorScheme } from 'nativewind';

export default function AppSettingsScreen() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-surface-950 dark:bg-surface-950">
      <View className="flex-row items-center p-4 border-b border-surface-200 dark:border-surface-800 dark:border-surface-800 bg-white dark:bg-surface-900 dark:bg-surface-900">
        <Pressable onPress={() => { if(router.canGoBack()) router.back(); else router.push('/settings' as any); }} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} className="mr-3 p-1">
          <ChevronLeft size={24} color={isDark ? "#ffffff" : "#18181b"} />
        </Pressable>
        <Text className="text-xl font-bold text-surface-900 dark:text-zinc-50 dark:text-zinc-50">App Settings</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-6">
        
        <Text className="text-sm font-bold text-surface-500 dark:text-zinc-400 dark:text-zinc-400 uppercase tracking-wider mb-2 ml-2">Notifications</Text>
        <View className="bg-white dark:bg-surface-900 dark:bg-surface-900 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 dark:border-surface-800 mb-6">
          <View className="flex-row items-center justify-between p-4 border-b border-zinc-100 dark:border-surface-800 dark:border-surface-800">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-brand-50 rounded-full items-center justify-center mr-3">
                <Bell size={16} color="#d97706" />
              </View>
              <Text className="text-base font-semibold text-surface-900 dark:text-zinc-50 dark:text-zinc-50">Push Notifications</Text>
            </View>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#e4e4e7', true: '#f59e0b' }} />
          </View>
          
          
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-brand-50 rounded-full items-center justify-center mr-3">
                <Globe size={16} color="#2563eb" />
              </View>
              <Text className="text-base font-semibold text-surface-900 dark:text-zinc-50 dark:text-zinc-50">Email Alerts</Text>
            </View>
            <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ false: '#e4e4e7', true: '#f59e0b' }} />
          </View>
        </View>

        <Text className="text-sm font-bold text-surface-500 dark:text-zinc-400 dark:text-zinc-400 uppercase tracking-wider mb-2 ml-2">Appearance</Text>
        <View className="bg-white dark:bg-surface-900 dark:bg-surface-900 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 dark:border-surface-800 mb-6">
          <View className="flex-row items-center justify-between p-4 ">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-surface-100 dark:bg-surface-800 dark:bg-surface-800 rounded-full items-center justify-center mr-3">
                <Moon size={16} color={isDark ? "#ffffff" : "#52525b"} />
              </View>
              <Text className="text-base font-semibold text-surface-900 dark:text-zinc-50 dark:text-zinc-50">Dark Mode</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleColorScheme} trackColor={{ false: '#e4e4e7', true: '#f59e0b' }} />
          </View>
        </View>

        <Text className="text-sm font-bold text-surface-500 dark:text-zinc-400 dark:text-zinc-400 uppercase tracking-wider mb-2 ml-2">Language</Text>
        <View className="bg-white dark:bg-surface-900 dark:bg-surface-900 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 dark:border-surface-800 mb-6">
          <View className="flex-row items-center justify-between p-4">
            <Text className="text-base font-semibold text-surface-900 dark:text-zinc-50 dark:text-zinc-50">English (US)</Text>
            <Text className="text-brand-600 font-bold">Selected</Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-surface-500 dark:text-zinc-400 uppercase tracking-wider mb-2 ml-2">Developer & Team</Text>
        <View className="bg-white dark:bg-surface-900 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 mb-10 p-4 shadow-sm shadow-zinc-100 dark:shadow-none">
          <View className="flex-row justify-between items-center mb-4 border-b border-surface-100 dark:border-surface-800 pb-4">
            <View className="flex-1 mr-2">
              <Text className="font-bold text-surface-900 dark:text-zinc-50 text-base">Vineeth B</Text>
              <Text className="text-surface-500 dark:text-zinc-400 text-xs mt-0.5">Lead Developer</Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity onPress={() => Linking.openURL('mailto:vineethbpawar@gmail.com')} className="p-2 bg-surface-50 dark:bg-surface-800 rounded-full">
                <Mail size={18} color="#059669" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/vineethbpawar?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==')} className="p-2 bg-surface-50 dark:bg-surface-800 rounded-full ml-3">
                <Link size={18} color="#e1306c" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-2">
              <Text className="font-bold text-surface-900 dark:text-zinc-50 text-base">Rakshith Gowda M K</Text>
              <Text className="text-surface-500 dark:text-zinc-400 text-xs mt-0.5">Marketing & Partner</Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity onPress={() => Linking.openURL('mailto:rakshithgowdarakshithgowda38@gmail.com')} className="p-2 bg-surface-50 dark:bg-surface-800 rounded-full">
                <Mail size={18} color="#059669" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/justt._.rakxhh?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==')} className="p-2 bg-surface-50 dark:bg-surface-800 rounded-full ml-3">
                <Link size={18} color="#e1306c" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
