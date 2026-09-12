import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Save } from 'lucide-react-native';

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    address: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone_number, address')
        .eq('id', session.user.id)
        .single();
      
      if (data) {
        setForm({
          full_name: data.full_name || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
        });
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone_number: form.phone_number,
        address: form.address,
      })
      .eq('id', userId);

    setSaving(false);

    if (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } else {
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-zinc-100 dark:active:bg-zinc-800">
                {/* @ts-ignore */}
                <ChevronLeft size={24} color="#f59e0b" />
              </Pressable>
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">Personal Details</Text>
              <View className="w-10" />
            </View>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
              
              <View className="items-center mb-8">
                <View className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900 items-center justify-center border-4 border-white dark:border-zinc-950 shadow-sm">
                  <Text className="text-amber-700 dark:text-amber-300 font-bold text-3xl">
                    {form.full_name?.charAt(0) || 'U'}
                  </Text>
                </View>
                <Text className="text-sm text-zinc-500 mt-3">Tap to change avatar (Coming soon)</Text>
              </View>

              <View className="space-y-5">
                <View className="space-y-1.5">
                  <Text className="text-sm font-semibold text-zinc-900 dark:text-white">Full Name</Text>
                  <TextInput
                    value={form.full_name}
                    onChangeText={(text) => setForm({ ...form, full_name: text })}
                    placeholder="Enter your full name"
                    placeholderTextColor="#A1A1AA"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-white shadow-sm"
                  />
                </View>

                <View className="space-y-1.5">
                  <Text className="text-sm font-semibold text-zinc-900 dark:text-white">Phone Number</Text>
                  <TextInput
                    value={form.phone_number}
                    onChangeText={(text) => setForm({ ...form, phone_number: text })}
                    placeholder="e.g. +91 9876543210"
                    placeholderTextColor="#A1A1AA"
                    keyboardType="phone-pad"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-white shadow-sm"
                  />
                </View>

                <View className="space-y-1.5">
                  <Text className="text-sm font-semibold text-zinc-900 dark:text-white">Address</Text>
                  <TextInput
                    value={form.address}
                    onChangeText={(text) => setForm({ ...form, address: text })}
                    placeholder="Enter your full address"
                    placeholderTextColor="#A1A1AA"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-white shadow-sm min-h-[100px]"
                  />
                </View>
              </View>

              <Pressable
                onPress={handleSave}
                disabled={saving}
                className={`w-full bg-amber-500 rounded-xl py-4 flex-row items-center justify-center mt-10 shadow-sm ${saving ? 'opacity-70' : ''}`}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    {/* @ts-ignore */}
                    <Save size={20} color="white" className="mr-2" />
                    <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>
                  </>
                )}
              </Pressable>

              <View className="h-20" />
            </ScrollView>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
