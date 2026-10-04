import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Briefcase, MapPin, Star, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { formatIndianCurrency } from '@/utils/format';

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
        .select('*, profiles:id (full_name, avatar_url)')
        .eq('is_available', true)
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

  const renderItem = ({ item }: { item: any }) => (
    <Pressable 
      onPress={() => router.push(`/professionals/${item.id}` as any)}
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-zinc-100 flex-row"
    >
      <View className="w-16 h-16 rounded-xl bg-zinc-100 mr-4 overflow-hidden items-center justify-center border border-zinc-200">
        {item.profiles?.avatar_url ? (
          <Image source={{ uri: item.profiles.avatar_url }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Briefcase size={24} color="#A1A1AA" />
        )}
      </View>
      <View className="flex-1 justify-center">
        <View className="flex-row items-center mb-1">
          <Text className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded mr-2">{item.category}</Text>
          {item.verification_level >= 3 && (
            <ShieldCheck size={14} color="#059669" />
          )}
        </View>
        <Text className="text-base font-bold text-zinc-900 mb-1" numberOfLines={1}>{item.company_name}</Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Star size={12} color="#FBBF24" fill="#FBBF24" />
            <Text className="text-xs text-zinc-600 font-medium">New</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color="#71717A" />
            <Text className="text-xs text-zinc-600 font-medium">{item.service_radius_km}km</Text>
          </View>
        </View>
      </View>
      <View className="justify-center pl-2">
        <ChevronRight size={20} color="#D4D4D8" />
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-zinc-50">
      <Stack.Screen options={{ title: 'Hire Professionals', headerTitleStyle: { fontWeight: 'bold' } }} />
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : (
        <FlatList
          data={pros}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="py-10 items-center justify-center">
              <Text className="text-zinc-500 font-medium">No professionals available right now.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
