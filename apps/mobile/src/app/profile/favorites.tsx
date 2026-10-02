import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { MapPin, Bed, Bath, Square, ArrowLeft, Heart } from 'lucide-react-native';

export default function FavoritesScreen() {
 const [properties, setProperties] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);
 const router = useRouter();

 const fetchFavorites = async () => {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) return;

 // Join saved_properties with properties
 const { data, error } = await supabase
 .from('saved_properties')
 .select(`
 id,
 properties:property_id (
 id, title, price, location, city, bhk, bathrooms, area_sqft, is_verified, purpose, status, verification_status,
 property_media ( url, media_type )
 )
 `)
 .eq('user_id', session.user.id)
 .order('created_at', { ascending: false });

 if (data) {
 // Extract properties from the joined result
 const favProperties = data.map(item => item.properties).filter(Boolean);
 setProperties(favProperties as any[]);
 } else {
 setProperties([]);
 }
 
 setLoading(false);
 setRefreshing(false);
 };

 useEffect(() => {
 fetchFavorites();
 }, []);

 const formatPrice = (price: number) => {
 return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
 };

 const renderItem = ({ item }: { item: any }) => {
 const mainImage = item.property_media?.find((m: any) => m.media_type === 'IMAGE')?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop';
 
 return (
 <Link href={`/property/${item.id}`} asChild>
 <Pressable className="bg-white rounded-2xl overflow-hidden mb-6 shadow-sm border border-surface-200 ">
 <Image 
 source={{ uri: mainImage }} 
 className="w-full h-48 bg-surface-200 "
 resizeMode="cover"
 />
 <View className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-md">
 <Text className="text-xs font-bold text-surface-900 uppercase">{item.purpose}</Text>
 </View>
 
 <View className="p-4 space-y-3">
 <View className="flex-row justify-between items-start">
 <View className="flex-1 pr-2">
 <Text className="text-xl font-bold text-surface-900 line-clamp-1">{item.title}</Text>
 <View className="flex-row items-center mt-1">
 {/* @ts-ignore */}
 <MapPin size={14} color="#71717A" />
 <Text className="text-sm text-surface-500 ml-1">{item.location}, {item.city}</Text>
 </View>
 </View>
 <Text className="text-xl font-bold text-brand-600">{formatPrice(item.price)}</Text>
 </View>

 <View className="flex-row items-center space-x-4 border-t border-zinc-100 pt-3">
 <View className="flex-row items-center">
 {/* @ts-ignore */}
 <Bed size={16} color="#71717A" />
 <Text className="text-xs text-surface-600 ml-1 font-medium">{item.bhk} BHK</Text>
 </View>
 <View className="flex-row items-center ml-4">
 {/* @ts-ignore */}
 <Bath size={16} color="#71717A" />
 <Text className="text-xs text-surface-600 ml-1 font-medium">{item.bathrooms} Bath</Text>
 </View>
 <View className="flex-row items-center ml-4">
 {/* @ts-ignore */}
 <Square size={16} color="#71717A" />
 <Text className="text-xs text-surface-600 ml-1 font-medium">{item.area_sqft} sqft</Text>
 </View>
 </View>
 </View>
 </Pressable>
 </Link>
 );
 };

 return (
 <SafeAreaView className="flex-1 bg-surface ">
 <View className="px-4 py-4 bg-white border-b border-surface-200 flex-row items-center">
 <Pressable onPress={() => router.push('/settings' as any)} className="mr-4 p-2 bg-surface-100 rounded-full">
 {/* @ts-ignore */}
 <ArrowLeft size={20} color="#71717A" />
 </Pressable>
 <Text className="text-xl font-bold text-surface-900 ">Saved Properties</Text>
 </View>
 
 {loading ? (
 <View className="flex-1 justify-center items-center">
 <ActivityIndicator size="large" color="#f59e0b" />
 </View>
 ) : (
 <FlatList
 data={properties}
 renderItem={renderItem}
 keyExtractor={(item) => item.id.toString()}
 contentContainerStyle={{ padding: 16 }}
 showsVerticalScrollIndicator={false}
 refreshControl={
 <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFavorites(); }} tintColor="#f59e0b" />
 }
 ListEmptyComponent={
 <View className="flex-1 justify-center items-center py-20 px-6 mt-10">
   <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-6">
     <Heart size={40} color="#ef4444" />
   </View>
   <Text className="text-2xl font-black text-surface-900 mb-3 text-center">No Favorites Yet</Text>
   <Text className="text-surface-500 text-center px-4 mb-8 leading-6 text-base">You haven't saved any properties. Tap the heart icon on any property to save it for later.</Text>
   <Pressable onPress={() => router.push('/(tabs)/explore')} className="bg-brand-500 px-8 py-3.5 rounded-2xl shadow-lg shadow-amber-500/30">
     <Text className="text-white font-bold text-lg">Explore Properties</Text>
   </Pressable>
 </View>
 }
 />
 )}
 </SafeAreaView>
 );
}
