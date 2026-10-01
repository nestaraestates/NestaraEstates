import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { MapPin, Bed, Bath, Square, ArrowLeft, TrendingUp, Heart, Building, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function MyPropertiesScreen() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchProperties = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Fetch properties AND their saved (favorite) counts via relational join
    const { data } = await supabase
      .from('properties')
      .select(`
        id, title, price, location, city, bhk, bathrooms, area_sqft, is_verified, purpose, status, verification_status,
        property_media ( url, media_type ),
        saved_properties ( user_id )
      `)
      .eq('owner_id', session.user.id)
      .neq('is_deleted', true)
      .order('created_at', { ascending: false });

    setProperties(data || []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  // Dashboard Aggregations
  const totalListings = properties.length;
  const activeListings = properties.filter(p => p.status === 'AVAILABLE').length;
  const totalValue = properties.reduce((sum, p) => sum + (p.price || 0), 0);
  const totalFavorites = properties.reduce((sum, p) => sum + (p.saved_properties?.length || 0), 0);

  const renderDashboardHeader = () => (
    <Animated.View entering={FadeIn.duration(600)} className="mb-6 mt-2">
      <Text className="text-2xl font-black text-zinc-900 mb-4 px-1">Analytics Overview</Text>
      
      <View className="flex-row justify-between mb-4">
        {/* Total Value Widget */}
        <View className="bg-emerald-600 rounded-3xl p-5 flex-1 mr-2 shadow-sm shadow-emerald-700/30">
          <TrendingUp size={24} color="#a7f3d0" className="mb-2" />
          <Text className="text-emerald-100 text-sm font-medium mb-1">Portfolio Value</Text>
          <Text className="text-white text-xl font-black">{totalValue > 0 ? formatPrice(totalValue) : '₹0'}</Text>
        </View>

        <View className="flex-1 ml-2 space-y-4">
          {/* Active Listings Widget */}
          <View className="bg-white rounded-3xl p-4 border border-zinc-200 shadow-sm shadow-zinc-200/50 flex-row items-center justify-between">
            <View>
              <Text className="text-zinc-500 text-xs font-bold uppercase mb-1">Active</Text>
              <Text className="text-zinc-900 text-xl font-black">{activeListings}</Text>
            </View>
            <View className="w-10 h-10 bg-amber-50 rounded-full items-center justify-center">
              <CheckCircle2 size={20} color="#3b82f6" />
            </View>
          </View>
          
          {/* Favorites Widget */}
          <View className="bg-white rounded-3xl p-4 border border-zinc-200 shadow-sm shadow-zinc-200/50 flex-row items-center justify-between mt-3">
            <View>
              <Text className="text-zinc-500 text-xs font-bold uppercase mb-1">Favorites</Text>
              <Text className="text-zinc-900 text-xl font-black">{totalFavorites}</Text>
            </View>
            <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center">
              <Heart size={20} color="#ef4444" />
            </View>
          </View>
        </View>
      </View>
      
      <Text className="text-lg font-bold text-zinc-900 mt-4 px-1">Your Listings</Text>
    </Animated.View>
  );

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const mainImage = item.property_media?.find((m: any) => m.media_type === 'IMAGE')?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop';
    const favCount = item.saved_properties?.length || 0;
    const isHot = favCount >= 2;
    
    return (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 10) * 100).springify()}>
        <Link href={`/property/${item.id}`} asChild>
          <Pressable className="bg-white rounded-3xl overflow-hidden mb-6 shadow-sm border border-zinc-200">
            <View className="relative">
              <Image source={{ uri: mainImage }} className="w-full h-52 bg-zinc-200" resizeMode="cover" />
              
              {/* Status Badge */}
              <View className="absolute top-3 left-3 bg-white/95 px-3 py-1.5 rounded-full shadow-sm">
                <Text className="text-xs font-bold text-zinc-900 uppercase tracking-wider">{item.status}</Text>
              </View>
              
              {/* Analytics Badge */}
              <View className="absolute bottom-3 right-3 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full flex-row items-center">
                <Heart size={14} color="#fca5a5" fill="#fca5a5" />
                <Text className="text-white text-xs font-bold ml-1.5">{favCount} Saves</Text>
              </View>

              {/* Hot Listing Tag */}
              {isHot && (
                <View className="absolute top-3 right-3 bg-amber-500 px-3 py-1.5 rounded-full shadow-sm flex-row items-center">
                  <Text className="text-white text-xs font-bold uppercase tracking-wider">🔥 Hot</Text>
                </View>
              )}
            </View>
            
            <View className="p-5 space-y-3">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-2">
                  <Text className="text-xl font-bold text-zinc-900 line-clamp-1">{item.title}</Text>
                  <View className="flex-row items-center mt-1.5">
                    <MapPin size={14} color="#71717A" />
                    <Text className="text-sm text-zinc-500 ml-1.5">{item.location}, {item.city}</Text>
                  </View>
                </View>
                <Text className="text-xl font-black text-amber-600">{formatPrice(item.price)}</Text>
              </View>

              <View className="flex-row items-center justify-between border-t border-zinc-100 pt-4 mt-2">
                <View className="flex-row items-center bg-zinc-50 px-3 py-2 rounded-xl">
                  <Bed size={16} color="#71717A" />
                  <Text className="text-xs font-bold text-zinc-700 ml-1.5">{item.bhk} BHK</Text>
                </View>
                <View className="flex-row items-center bg-zinc-50 px-3 py-2 rounded-xl">
                  <Bath size={16} color="#71717A" />
                  <Text className="text-xs font-bold text-zinc-700 ml-1.5">{item.bathrooms} Bath</Text>
                </View>
                <View className="flex-row items-center bg-zinc-50 px-3 py-2 rounded-xl">
                  <Square size={16} color="#71717A" />
                  <Text className="text-xs font-bold text-zinc-700 ml-1.5">{item.area_sqft} sqft</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Link>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <View className="px-4 py-4 bg-white border-b border-zinc-200 flex-row items-center shadow-sm z-10">
        <Pressable onPress={() => router.push('/settings' as any)} className="mr-4 p-2 bg-zinc-100 rounded-full">
          <ArrowLeft size={20} color="#71717A" />
        </Pressable>
        <Text className="text-xl font-bold text-zinc-900">Dashboard</Text>
      </View>
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderDashboardHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProperties(); }} tintColor="#059669" />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20">
              <Building size={48} color="#d4d4d8" className="mb-4" />
              <Text className="text-lg font-bold text-zinc-900 mb-2">No Active Listings</Text>
              <Text className="text-zinc-500 text-center px-8">You haven't posted any properties yet. Your stats will appear here once you list your first property.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
