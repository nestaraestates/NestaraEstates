import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { MapPin, Bed, Bath, Square, ArrowLeft } from 'lucide-react-native';

export default function MyPropertiesScreen() {
 const [properties, setProperties] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);
 const router = useRouter();

 const fetchProperties = async () => {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) return;

 const { data } = await supabase
 .from('properties')
 .select(`
 id, title, price, location, city, bhk, bathrooms, area_sqft, is_verified, purpose, status, verification_status,
 property_media ( url, media_type )
 `)
 .eq('owner_id', session.user.id).neq('is_deleted', true)
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

 const renderItem = ({ item }: { item: any }) => {
 const mainImage = item.property_media?.find((m: any) => m.media_type === 'IMAGE')?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop';
 
 return (
 <Link href={`/property/${item.id}`} asChild>
 <Pressable className="bg-white rounded-2xl overflow-hidden mb-6 shadow-sm border border-zinc-200 ">
 <Image 
 source={{ uri: mainImage }} 
 className="w-full h-48 bg-zinc-200 "
 resizeMode="cover"
 />
 <View className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-md">
 <Text className="text-xs font-bold text-zinc-900 uppercase">{item.status}</Text>
 </View>
 
 <View className="p-4 space-y-3">
 <View className="flex-row justify-between items-start">
 <View className="flex-1 pr-2">
 <Text className="text-xl font-bold text-zinc-900 line-clamp-1">{item.title}</Text>
 <View className="flex-row items-center mt-1">
 {/* @ts-ignore */}
 <MapPin size={14} color="#71717A" />
 <Text className="text-sm text-zinc-500 ml-1">{item.location}, {item.city}</Text>
 </View>
 </View>
 <Text className="text-xl font-bold text-amber-600">{formatPrice(item.price)}</Text>
 </View>

 <View className="flex-row items-center space-x-4 border-t border-zinc-100 pt-3">
 <View className="flex-row items-center">
 {/* @ts-ignore */}
 <Bed size={16} color="#71717A" />
 <Text className="text-xs text-zinc-600 ml-1 font-medium">{item.bhk} BHK</Text>
 </View>
 <View className="flex-row items-center ml-4">
 {/* @ts-ignore */}
 <Bath size={16} color="#71717A" />
 <Text className="text-xs text-zinc-600 ml-1 font-medium">{item.bathrooms} Bath</Text>
 </View>
 <View className="flex-row items-center ml-4">
 {/* @ts-ignore */}
 <Square size={16} color="#71717A" />
 <Text className="text-xs text-zinc-600 ml-1 font-medium">{item.area_sqft} sqft</Text>
 </View>
 </View>
 </View>
 </Pressable>
 </Link>
 );
 };

 return (
 <SafeAreaView className="flex-1 bg-zinc-50 ">
 <View className="px-4 py-4 bg-white border-b border-zinc-200 flex-row items-center">
 <Pressable onPress={() => router.push('/settings' as any)} className="mr-4 p-2 bg-zinc-100 rounded-full">
 {/* @ts-ignore */}
 <ArrowLeft size={20} color="#71717A" />
 </Pressable>
 <Text className="text-xl font-bold text-zinc-900 ">My Properties</Text>
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
 <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProperties(); }} tintColor="#f59e0b" />
 }
 ListEmptyComponent={
 <View className="flex-1 justify-center items-center py-20">
 <Text className="text-zinc-500 ">You haven't listed any properties yet.</Text>
 </View>
 }
 />
 )}
 </SafeAreaView>
 );
}
