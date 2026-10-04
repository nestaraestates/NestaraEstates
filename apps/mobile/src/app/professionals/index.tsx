import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Briefcase, MapPin, Star, ShieldCheck, ChevronRight, Camera, User, IndianRupee } from 'lucide-react-native';

export default function ProfessionalsDirectoryScreen() {
  const router = useRouter();
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPros();
  }, []);

  async function fetchPros() {
    try {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*, profiles (full_name, avatar_url), professional_portfolios (media_urls)')
        .order('verification_level', { ascending: false });
        
      if (!error && data) {
        setPros(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }: { item: any }) => {
    const name = item.company_name || item.profiles?.full_name || 'Unknown';
    const firstMedia = (item.professional_portfolios && item.professional_portfolios.length > 0 && item.professional_portfolios[0].media_urls?.length > 0) 
      ? item.professional_portfolios[0].media_urls[0] 
      : null;

    return (
      <Pressable 
        onPress={() => router.push(`/professionals/${item.id}` as any)}
        className="bg-white rounded-3xl overflow-hidden mb-6 shadow-sm border border-zinc-200"
      >
        <View className="h-48 bg-zinc-100 relative">
          {firstMedia ? (
            <Image source={{ uri: firstMedia }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Camera size={32} color="#A1A1AA" className="opacity-50 mb-2" />
              <Text className="text-xs text-zinc-400 font-medium uppercase tracking-widest">No Portfolio</Text>
            </View>
          )}
          {item.verification_level > 2 && (
            <View className="absolute top-3 right-3 bg-brand-500 p-1.5 rounded-full shadow-sm">
              <ShieldCheck size={16} color="white" />
            </View>
          )}
        </View>

        <View className="p-5">
          <View className="flex-row items-center mb-4">
            {item.profiles?.avatar_url ? (
              <Image source={{ uri: item.profiles.avatar_url }} className="w-12 h-12 rounded-full border-2 border-zinc-100 mr-3" />
            ) : (
              <View className="w-12 h-12 rounded-full bg-zinc-100 border-2 border-zinc-200 items-center justify-center mr-3">
                <User size={20} color="#A1A1AA" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-[10px] font-black uppercase tracking-wider text-brand-600 mb-0.5">
                {item.category} {item.sub_category ? `- ${item.sub_category}` : ''}
              </Text>
              <Text className="text-lg font-bold text-zinc-900" numberOfLines={1}>{name}</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-x-4 gap-y-2 mb-4">
            <View className="flex-row items-center">
              <Briefcase size={16} color="#71717A" className="mr-1.5" />
              <Text className="text-sm font-medium text-zinc-700">{item.years_experience} Yrs Exp.</Text>
            </View>
            {!!item.base_price_amount && (
              <View className="flex-row items-center">
                <IndianRupee size={16} color="#71717A" className="mr-1" />
                <Text className="text-sm font-bold text-zinc-900">
                  {item.base_price_amount}
                  <Text className="text-xs font-normal text-zinc-500">
                    {item.pricing_model === 'PER_HOUR' ? '/hr' : item.pricing_model === 'PER_SQFT' ? '/sq.ft' : ''}
                  </Text>
                </Text>
              </View>
            )}
            <View className="flex-row items-center">
              <MapPin size={16} color="#71717A" className="mr-1.5" />
              <Text className="text-sm font-medium text-zinc-700">{item.service_radius_km}km Radius</Text>
            </View>
          </View>
          
          <View className="bg-brand-50 rounded-xl py-3 items-center justify-center flex-row">
             <Text className="text-brand-700 font-bold">View Profile</Text>
             <ChevronRight size={18} color="#0369a1" className="ml-1" />
          </View>
        </View>
      </Pressable>
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ title: 'Hire Professionals', headerTitleStyle: { fontWeight: 'bold' }, headerShown: false }} />
      
      <View className="px-4 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-zinc-200 mb-4">
          <ChevronRight size={24} color="#52525B" style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
        <Text className="text-2xl font-black text-zinc-900 mb-1">Global Service Directory</Text>
        <Text className="text-sm text-zinc-500">Find verified experts to design, build, and transport.</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : (
        <FlatList
          data={pros}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="py-16 items-center justify-center">
              <User size={48} color="#D4D4D8" className="mb-4" />
              <Text className="text-zinc-500 font-medium">No professionals available right now.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
