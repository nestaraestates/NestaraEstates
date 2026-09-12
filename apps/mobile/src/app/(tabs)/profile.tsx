import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { User, Heart, Home, Settings, LogOut, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  const menuItems = [
    { icon: <User size={22} /> as any, title: 'Personal Details', subtitle: 'Update your information' },
    { icon: <Home size={22} /> as any, title: 'My Properties', subtitle: 'Manage your listings' },
    { icon: <Heart size={22} /> as any, title: 'Favorites', subtitle: 'Saved properties' },
    { icon: <Settings size={22} /> as any, title: 'Settings', subtitle: 'App preferences' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-1">
        
        {/* Header Profile Section */}
        <View className="p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex-row items-center space-x-4">
          <View className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900 items-center justify-center">
            <Text className="text-amber-700 dark:text-amber-300 font-bold text-2xl">
              {profile?.full_name?.charAt(0) || 'U'}
            </Text>
          </View>
          <View>
            <Text className="text-xl font-bold text-zinc-900 dark:text-white">{profile?.full_name || 'Nestara User'}</Text>
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">{profile?.role === 'SELLER' ? 'Seller Account' : 'Buyer Account'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mt-6 px-4">
          <View className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            {menuItems.map((item, index) => (
              <Pressable 
                key={index} 
                onPress={() => {
                  if (item.title === 'Personal Details') router.push('/profile/details');
                  if (item.title === 'My Properties') router.push('/profile/properties');
                  if (item.title === 'Favorites') router.push('/profile/favorites');
                }}
                className={`flex-row items-center p-4 ${index !== menuItems.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}
              >
                <View className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full items-center justify-center mr-4">
                  {item.icon}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-zinc-900 dark:text-white">{item.title}</Text>
                  <Text className="text-xs text-zinc-500">{item.subtitle}</Text>
                </View>
                {/* @ts-ignore */}
                <ChevronRight size={20} color="#A1A1AA" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sign Out Button */}
        <View className="mt-8 px-4 mb-10">
          <Pressable 
            onPress={handleSignOut}
            className="flex-row items-center justify-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 py-3 rounded-xl"
          >
            {/* @ts-ignore */}
            <LogOut size={20} color="#DC2626" />
            <Text className="text-red-600 font-bold ml-2">Sign Out</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
