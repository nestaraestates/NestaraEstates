import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { User, Heart, Home, Settings, LogOut, ChevronRight, Bell, Shield, HelpCircle, FileText } from 'lucide-react-native';

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
 <View className="flex-1 justify-center items-center bg-zinc-50 ">
 <ActivityIndicator size="large" color="#f59e0b" />
 </View>
 );
 }

 const menuSections = [
    {
      title: 'Account & Listings',
      items: [
        { icon: <User size={22} color="#4f46e5" /> as any, title: 'Personal Details', subtitle: 'Update your profile and address', route: '/profile/details' },
        { icon: <Home size={22} color="#059669" /> as any, title: 'My Properties', subtitle: 'Manage your active listings', route: '/profile/properties' },
        { icon: <Heart size={22} color="#ef4444" /> as any, title: 'Favorites', subtitle: 'Properties you have saved', route: '/profile/favorites' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: <Bell size={22} color="#f59e0b" /> as any, title: 'Notifications', subtitle: 'Manage alerts and messages', route: '/notifications' },
        { icon: <Settings size={22} color="#64748b" /> as any, title: 'App Settings', subtitle: 'Language, dark mode, etc.', route: '/settings/app-settings' },
      ]
    },
    {
      title: 'Support & About',
      items: [
        { icon: <HelpCircle size={22} color="#0ea5e9" /> as any, title: 'Help & Support', subtitle: 'FAQs and Contact', route: '/settings/help' },
        { icon: <Shield size={22} color="#10b981" /> as any, title: 'Privacy Policy', subtitle: 'How we protect your data', route: '/settings/privacy' },
        { icon: <FileText size={22} color="#6366f1" /> as any, title: 'Terms of Service', subtitle: 'Our terms and rules', route: '/settings/terms' },
      ]
    }
  ];

 return (
 <SafeAreaView className="flex-1 bg-zinc-50 ">
 <ScrollView className="flex-1">
 
 {/* Header Profile Section */}
 <View className="px-6 py-8 bg-white border-b border-zinc-200 flex-row items-center gap-5">
 <View className="w-20 h-20 rounded-full bg-amber-100 items-center justify-center overflow-hidden border-2 border-amber-200 shadow-sm">
 {profile?.avatar_url ? (
   <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
 ) : (
   <Text className="text-amber-700 font-bold text-3xl">
     {profile?.full_name?.charAt(0) || 'U'}
   </Text>
 )}
 </View>
 <View className="flex-1 justify-center">
 <Text className="text-2xl font-bold text-zinc-900 mb-1" numberOfLines={1}>{profile?.full_name || 'Nestara User'}</Text>
 <Text className="text-base text-zinc-500 mb-2" numberOfLines={1}>{profile?.email || ''}</Text>
 <View className="bg-amber-100 self-start px-3 py-1 rounded-full border border-amber-200">
   <Text className="text-xs font-bold text-amber-700 uppercase tracking-wide">{profile?.role === 'DEALER' ? 'Seller Account' : profile?.role === 'ADMIN' ? 'Administrator' : 'Buyer Account'}</Text>
 </View>
 </View>
 </View>

 {/* Menu Sections */}
  {menuSections.map((section, sIndex) => (
    <View key={sIndex} className="mt-6 px-4">
      <Text className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3 ml-2">{section.title}</Text>
      <View className="bg-white rounded-2xl overflow-hidden border border-zinc-200">
        {section.items.map((item, index) => (
          <Pressable 
            key={index} 
            onPress={() => {
              if (item.route) router.push(item.route as any);
            }}
            className={`flex-row items-center p-4 ${index !== section.items.length - 1 ? 'border-b border-zinc-100' : ''}`}
          >
            <View className="w-10 h-10 bg-zinc-50 rounded-full items-center justify-center mr-4">
              {item.icon}
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-zinc-900">{item.title}</Text>
              <Text className="text-xs text-zinc-500 mt-0.5">{item.subtitle}</Text>
            </View>
            {/* @ts-ignore */}
            <ChevronRight size={20} color="#d4d4d8" />
          </Pressable>
        ))}
      </View>
    </View>
  ))}

 {/* Sign Out Button */}
 <View className="mt-8 px-4 mb-10">
 <Pressable 
 onPress={handleSignOut}
 className="flex-row items-center justify-center bg-red-50 border border-red-200 py-3 rounded-xl"
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
