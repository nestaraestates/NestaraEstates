import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Bell, MapPin, Camera, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';

export function PermissionsPopup() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasAsked = await AsyncStorage.getItem('hasAskedPermissions');
      if (hasAsked !== 'true') {
        setVisible(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const requestPermissions = async () => {
    setLoading(true);
    try {
      // 1. Push Notifications
      let token = '';
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus === 'granted') {
        try {
          const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
          const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
          token = pushTokenString;
          
          // Save token to Supabase if logged in
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            await supabase
              .from('profiles')
              .update({ push_token: token })
              .eq('id', session.user.id);
          }
        } catch (e) {
          console.warn("Could not get push token", e);
        }
      }

      // 2. Location
      await Location.requestForegroundPermissionsAsync();

      // 3. Media/Camera
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      await ImagePicker.requestCameraPermissionsAsync();

      await AsyncStorage.setItem('hasAskedPermissions', 'true');
      setVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'There was an issue requesting permissions.');
    } finally {
      setLoading(false);
    }
  };

  const skipPermissions = async () => {
    await AsyncStorage.setItem('hasAskedPermissions', 'true');
    setVisible(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-zinc-900 rounded-t-3xl p-6 pb-12 w-full shadow-2xl">
          
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">App Permissions</Text>
            <TouchableOpacity onPress={skipPermissions} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <X size={20} color="#71717A" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-base text-zinc-600 dark:text-zinc-400 mb-6 leading-6">
            To get the best experience out of Nestara, we need a few permissions.
          </Text>

          <View className="space-y-6 mb-8">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                <Bell size={24} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Notifications</Text>
                <Text className="text-zinc-500 dark:text-zinc-400">Get instantly notified about your listings.</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center">
                <MapPin size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Location</Text>
                <Text className="text-zinc-500 dark:text-zinc-400">Find premium properties near you.</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center">
                <Camera size={24} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Camera & Media</Text>
                <Text className="text-zinc-500 dark:text-zinc-400">Upload beautiful property photos.</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            onPress={requestPermissions}
            disabled={loading}
            className="w-full bg-blue-600 rounded-xl py-4 items-center mb-4 flex-row justify-center shadow-sm"
          >
            {loading ? <ActivityIndicator color="white" className="mr-2" /> : null}
            <Text className="text-white font-bold text-lg">Allow Permissions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={skipPermissions} className="w-full items-center py-2">
            <Text className="text-zinc-500 font-medium">Maybe Later</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}
