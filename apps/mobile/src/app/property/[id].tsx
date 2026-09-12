import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, Pressable, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { MapPin, Bed, Bath, Square, ChevronLeft, Calendar, Info, Phone, MessageSquare, ShieldCheck, Heart } from 'lucide-react-native';
import { FinancialTools } from '@/components/FinancialTools';

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      let userId = null;
      if (session) {
        userId = session.user.id;
        setCurrentUserId(userId);
      }

      const [propRes, favRes] = await Promise.all([
        supabase
          .from('properties')
          .select(`
            *,
            seller:seller_id (id, full_name, email, phone, avatar_url),
            property_media (url, media_type)
          `)
          .eq('id', id)
          .single(),
        userId ? supabase.from('saved_properties').select('id').eq('user_id', userId).eq('property_id', id).single() : Promise.resolve({ data: null })
      ]);
      
      setProperty(propRes.data);
      if (favRes.data) setIsFavorited(true);
      
      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  const toggleFavorite = async () => {
    if (!currentUserId) {
      Alert.alert('Login Required', 'You must be logged in to save properties.');
      return;
    }

    if (isFavorited) {
      setIsFavorited(false);
      await supabase.from('saved_properties').delete().eq('user_id', currentUserId).eq('property_id', id);
    } else {
      setIsFavorited(true);
      await supabase.from('saved_properties').insert([{ user_id: currentUserId, property_id: id }]);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-50 dark:bg-zinc-950">
        <Text className="text-zinc-500">Property not found.</Text>
      </View>
    );
  }

  const mainImage = property.property_media?.find((m: any) => m.media_type === 'IMAGE')?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop';

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
        {/* Image Header */}
        <View className="relative w-full h-72 bg-zinc-200 dark:bg-zinc-800">
          <Image source={{ uri: mainImage }} className="w-full h-full" resizeMode="cover" />
          
          <SafeAreaView className="absolute top-0 w-full flex-row justify-between px-4 pt-2">
            <Pressable 
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md"
            >
              {/* @ts-ignore */}
              <ChevronLeft size={24} color="white" />
            </Pressable>

            {currentUserId !== property.seller_id && (
              <Pressable 
                onPress={toggleFavorite}
                className="w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md"
              >
                {/* @ts-ignore */}
                <Heart size={20} color={isFavorited ? "#ef4444" : "white"} fill={isFavorited ? "#ef4444" : "transparent"} />
              </Pressable>
            )}
          </SafeAreaView>
          
          <View className="absolute bottom-4 left-4 bg-amber-500 px-3 py-1 rounded-md">
            <Text className="text-xs font-bold text-white uppercase">{property.purpose}</Text>
          </View>
        </View>

        {/* Content */}
        <View className="p-5 space-y-6">
          <View>
            <View className="flex-row justify-between items-start">
              <Text className="text-2xl font-bold text-zinc-900 dark:text-white flex-1 pr-4">{property.title}</Text>
              <Text className="text-2xl font-bold text-amber-600">{formatPrice(property.price)}</Text>
            </View>
            <View className="flex-row items-center mt-2">
              {/* @ts-ignore */}
              <MapPin size={16} color="#71717A" />
              <Text className="text-base text-zinc-500 dark:text-zinc-400 ml-1">{property.location}, {property.city}</Text>
            </View>
          </View>

          {/* Key Features */}
          <View className="flex-row items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <View className="items-center">
              {/* @ts-ignore */}
              <Bed size={24} color="#f59e0b" />
              <Text className="text-sm font-semibold text-zinc-900 dark:text-white mt-1">{property.bhk}</Text>
              <Text className="text-xs text-zinc-500">BHK</Text>
            </View>
            <View className="w-[1px] h-10 bg-zinc-200 dark:bg-zinc-800"></View>
            <View className="items-center">
              {/* @ts-ignore */}
              <Bath size={24} color="#f59e0b" />
              <Text className="text-sm font-semibold text-zinc-900 dark:text-white mt-1">{property.bathrooms}</Text>
              <Text className="text-xs text-zinc-500">Baths</Text>
            </View>
            <View className="w-[1px] h-10 bg-zinc-200 dark:bg-zinc-800"></View>
            <View className="items-center">
              {/* @ts-ignore */}
              <Square size={24} color="#f59e0b" />
              <Text className="text-sm font-semibold text-zinc-900 dark:text-white mt-1">{property.area_sqft}</Text>
              <Text className="text-xs text-zinc-500">Sq.Ft.</Text>
            </View>
          </View>

          {/* Verification Status */}
          <View className={`p-4 rounded-xl border ${property.is_verified ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'}`}>
            <View className="flex-row items-center mb-3">
              {/* @ts-ignore */}
              <ShieldCheck size={20} color={property.is_verified ? "#10b981" : "#f59e0b"} />
              <Text className={`font-bold ml-2 ${property.is_verified ? 'text-emerald-700 dark:text-emerald-500' : 'text-amber-700 dark:text-amber-500'}`}>
                {property.is_verified ? 'Verification Status: Verified' : 'Verification Status: Pending/Unverified'}
              </Text>
            </View>
            <View className="space-y-1">
              <Text className={`text-sm ${property.is_verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>• Title Document: {property.is_verified ? 'Verified' : 'Pending'}</Text>
              <Text className={`text-sm ${property.is_verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>• Identity Check: {property.is_verified ? 'Verified' : 'Pending'}</Text>
              <Text className={`text-sm ${property.is_verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>• Encumbrances: {property.is_verified ? 'Verified' : 'Pending'}</Text>
            </View>
          </View>

          {/* Description */}
          <View className="space-y-2 mb-2">
            <Text className="text-lg font-bold text-zinc-900 dark:text-white">Description</Text>
            <Text className="text-zinc-600 dark:text-zinc-300 leading-6">{property.description || "No description provided by the seller."}</Text>
          </View>

          {/* Financial Tools */}
          <View className="mb-2 mt-4">
            <FinancialTools propertyPrice={property.price} purpose={property.purpose} />
          </View>

          {/* Location Map Placeholder */}
          <View className="space-y-3">
            <Text className="text-lg font-bold text-zinc-900 dark:text-white">Location Map</Text>
            <View className="w-full h-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl overflow-hidden items-center justify-center border border-zinc-200 dark:border-zinc-800">
              <View className="absolute inset-0 opacity-30 bg-black"></View>
              <View className="bg-white/90 dark:bg-zinc-900/90 p-4 rounded-xl items-center shadow-sm w-3/4">
                <View className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full items-center justify-center mb-2">
                  {/* @ts-ignore */}
                  <MapPin size={20} color="#d97706" />
                </View>
                <Text className="font-bold text-zinc-900 dark:text-white mb-1">Location Protected</Text>
                <Text className="text-xs text-center text-zinc-500">Contact the seller to get the exact location details.</Text>
              </View>
            </View>
          </View>

          {/* Contact Seller or Owner Actions */}
          {currentUserId === property.seller_id ? (
            <View className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-xl border border-amber-200 dark:border-amber-900 shadow-sm mb-8 items-center">
              <View className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mb-3">
                {/* @ts-ignore */}
                <ShieldCheck size={24} color="#d97706" />
              </View>
              <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Your Listing</Text>
              <Text className="text-sm text-center text-zinc-600 dark:text-zinc-400 mb-5">
                You are the owner of this property. You can edit the details or remove it from the market.
              </Text>
              
              <View className="w-full space-y-3">
                <Pressable 
                  onPress={() => Alert.alert('Edit', 'Edit Property screen is coming next!')}
                  className="w-full bg-amber-500 py-3 rounded-lg items-center"
                >
                  <Text className="text-white font-bold">Edit Listing</Text>
                </Pressable>
                
                <Pressable 
                  onPress={() => Alert.alert('Delete', 'Delete Property logic coming next!')}
                  className="w-full border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 py-3 rounded-lg items-center"
                >
                  <Text className="text-red-600 font-bold">Delete Listing</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-8">
              <Text className="text-base font-bold text-zinc-900 dark:text-white">Listed by</Text>
              <View className="flex-row items-center space-x-3">
                <View className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 items-center justify-center">
                  <Text className="text-amber-700 dark:text-amber-300 font-bold text-lg">
                    {property.seller?.full_name?.charAt(0) || 'U'}
                  </Text>
                </View>
                <View>
                  <Text className="font-semibold text-zinc-900 dark:text-white">{property.seller?.full_name || 'Nestara User'}</Text>
                  <Text className="text-sm text-zinc-500">Property Owner</Text>
                </View>
              </View>
              <View className="flex-row space-x-3 mt-2">
                <Pressable 
                  onPress={() => {
                    if (property.seller?.phone) {
                      Linking.openURL(`tel:${property.seller.phone}`);
                    } else {
                      Alert.alert('No Phone Number', 'This seller has not provided a phone number.');
                    }
                  }}
                  className="flex-1 flex-row items-center justify-center bg-zinc-900 dark:bg-white py-3 rounded-lg mr-2"
                >
                  {/* @ts-ignore */}
                  <Phone size={18} color={property.seller ? "white" : "black"} />
                  <Text className="text-white dark:text-zinc-900 font-medium ml-2">Call</Text>
                </Pressable>
                
                <Pressable 
                  onPress={() => {
                    if (property.seller?.phone) {
                      Alert.alert(
                        'Contact Seller',
                        'How would you like to message the seller?',
                        [
                          {
                            text: 'WhatsApp',
                            onPress: () => {
                              const phone = property.seller.phone.replace(/[^0-9]/g, '');
                              Linking.openURL(`whatsapp://send?phone=${phone}`);
                            }
                          },
                          {
                            text: 'In-App Chat',
                            onPress: () => {
                              // We will route to the inbox/chat screen here
                              Alert.alert('Coming Soon', 'In-App Chat is being built next!');
                            }
                          },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    } else {
                      Alert.alert('No Phone Number', 'This seller has not provided a phone number.');
                    }
                  }}
                  className="flex-1 flex-row items-center justify-center bg-amber-500 py-3 rounded-lg ml-2"
                >
                  {/* @ts-ignore */}
                  <MessageSquare size={18} color="white" />
                  <Text className="text-white font-medium ml-2">Message</Text>
                </Pressable>
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
