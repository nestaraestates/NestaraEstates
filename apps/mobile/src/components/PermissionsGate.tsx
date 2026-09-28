import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { registerForPushNotificationsAsync } from '@/utils/pushNotifications';
import { MapPin, Image as ImageIcon, Bell, ShieldCheck } from 'lucide-react-native';

export function PermissionsGate() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const hasSeen = await AsyncStorage.getItem('has_seen_permissions_v1');
      if (!hasSeen) {
        setIsVisible(true);
      } else {
        // Silently request/register push token if they previously accepted
        // and app mounts on subsequent launches
        registerForPushNotificationsAsync();
      }
    } catch (e) {
      console.log('Error checking permissions async storage', e);
    }
  };

  const handleAccept = async () => {
    setIsVisible(false);
    await AsyncStorage.setItem('has_seen_permissions_v1', 'true');

    try {
      // 1. Ask for Location
      await Location.requestForegroundPermissionsAsync();
      // 2. Ask for Media Library
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      // 3. Ask for Push Notifications
      await registerForPushNotificationsAsync();
    } catch (e) {
      console.log('Error requesting permissions', e);
    }
  };

  const handleDecline = async () => {
    setIsVisible(false);
    await AsyncStorage.setItem('has_seen_permissions_v1', 'true');
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white dark:bg-zinc-900 rounded-t-3xl p-6">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-4">
              <ShieldCheck size={32} color="#d97706" />
            </View>
            <Text className="text-2xl font-black text-slate-900 dark:text-zinc-50 text-center">App Permissions</Text>
            <Text className="text-slate-500 dark:text-zinc-400 text-center mt-2 font-medium leading-relaxed">
              To give you the best experience, Nestara Estates needs access to a few things.
            </Text>
          </View>

          <View className="space-y-4 mb-8">
            <View className="flex-row items-center p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
                <MapPin size={20} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-900 dark:text-zinc-50">Location</Text>
                <Text className="text-sm text-slate-500 dark:text-zinc-400">To pinpoint property locations accurately.</Text>
              </View>
            </View>

            <View className="flex-row items-center p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-4">
                <ImageIcon size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-900 dark:text-zinc-50">Photos & Media</Text>
                <Text className="text-sm text-slate-500 dark:text-zinc-400">To upload property images and documents.</Text>
              </View>
            </View>

            <View className="flex-row items-center p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                <Bell size={20} color="#9333ea" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-900 dark:text-zinc-50">Notifications</Text>
                <Text className="text-sm text-slate-500 dark:text-zinc-400">To alert you about chat messages and properties.</Text>
              </View>
            </View>
          </View>

          <Pressable 
            onPress={handleAccept}
            className="bg-amber-500 py-4 rounded-xl items-center shadow-sm"
          >
            <Text className="text-white font-bold text-lg">Continue & Allow</Text>
          </Pressable>
          
          <Pressable 
            onPress={handleDecline}
            className="py-4 items-center mt-2"
          >
            <Text className="text-slate-400 dark:text-zinc-500 font-bold">Maybe Later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
