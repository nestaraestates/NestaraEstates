import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { MapPin, Bed, Bath, Square, Heart, Home as HomeIcon, Scale, ShieldCheck } from 'lucide-react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { formatIndianCurrency } from '@/utils/format';
import { useCompareStore } from '@/store/compare';

interface PropertyProps {
  property: {
    id: string;
    title: string;
    price: number;
    location: string;
    city: string;
    bhk: number;
    bathrooms: number;
    area_sqft: number;
    property_media?: { url: string }[];
    type: string;
    is_verified?: boolean;
  };
  isSavedInitial?: boolean;
}

export default function PropertyCard({ property, isSavedInitial = false }: PropertyProps) {
  const [isSaved, setIsSaved] = useState(isSavedInitial);

  useEffect(() => {
    setIsSaved(isSavedInitial);
  }, [isSavedInitial]);

  const imageUrl = property.property_media?.[0]?.url;

  const compareIds = useCompareStore((state) => state.compareIds);
  const toggleCompare = useCompareStore((state) => state.toggleCompare);
  const isCompared = compareIds.includes(property.id);

  const toggleSaved = async () => {
    const newState = !isSaved;
    setIsSaved(newState);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (newState) {
      await supabase.from('saved_properties').insert([{ user_id: session.user.id, property_id: property.id }]);
    } else {
      await supabase.from('saved_properties').delete().eq('user_id', session.user.id).eq('property_id', property.id);
    }
  };

  return (
    <Link href={`/property/${property.id}`} asChild>
      <Pressable className="bg-white rounded-[20px] overflow-hidden shadow-md shadow-zinc-200/50 mb-5 border border-zinc-100">
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }}
            className="w-full h-52"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-52 bg-zinc-100 items-center justify-center">
            <Image source={require('@/assets/images/logo-sm.png')} className="w-16 h-16 opacity-30" resizeMode="contain" />
            <Text className="text-zinc-400 font-medium mt-3">No Image Available</Text>
          </View>
        )}
        
        <View className="absolute top-3 right-3 bg-white/95 px-3 py-1.5 rounded-full shadow-sm">
          <Text className="text-xs font-bold tracking-wider text-zinc-800 uppercase">{property.type}</Text>
        </View>

        {/* Favorites Button */}
        <Pressable 
          onPress={toggleSaved}
          className="absolute top-3 left-3 bg-white/95 p-2 rounded-full shadow-sm"
        >
          <Heart size={18} color={isSaved ? "#ef4444" : "#71717a"} fill={isSaved ? "#ef4444" : "transparent"} />
        </Pressable>
        <Pressable 
          onPress={() => toggleCompare(property.id)}
          className={`absolute top-3 left-14 ${isCompared ? 'bg-amber-100 border border-amber-300' : 'bg-white/95'} p-2 rounded-full shadow-sm`}
        >
          <Scale size={18} color={isCompared ? "#d97706" : "#71717a"} />
        </Pressable>
        
        <View className="p-5">
          <View className="flex-row justify-between items-center mb-1.5">
            <Text className="text-2xl font-black text-amber-500">
              {formatIndianCurrency(property.price)}
            </Text>
            {property.is_verified ? (
              <View className="flex-row items-center border border-emerald-500 px-2 py-1 rounded-full">
                <ShieldCheck size={12} color="#10b981" />
                <Text className="text-[10px] font-bold text-emerald-600 ml-1 uppercase">Verified</Text>
              </View>
            ) : (
              <View className="flex-row items-center border border-zinc-300 px-2 py-1 rounded-full">
                <ShieldCheck size={12} color="#71717a" />
                <Text className="text-[10px] font-bold text-zinc-500 ml-1 uppercase">Unverified</Text>
              </View>
            )}
          </View>
          <Text className="text-lg font-bold text-zinc-900 mb-2" numberOfLines={1}>
            {property.title}
          </Text>
          
          <View className="flex-row items-center mb-4">
            <MapPin size={16} color="#71717a" />
            <Text className="text-sm font-medium text-zinc-500 ml-1.5" numberOfLines={1}>{property.location}, {property.city}</Text>
          </View>
          
          <View className="flex-row items-center justify-between border-t border-zinc-100 pt-4">
            <View className="flex-row items-center bg-zinc-50 px-2.5 py-1.5 rounded-lg">
              <Bed size={16} color="#f59e0b" />
              <Text className="text-xs font-bold text-zinc-700 ml-1.5">{property.bhk} Beds</Text>
            </View>
            <View className="flex-row items-center bg-zinc-50 px-2.5 py-1.5 rounded-lg">
              <Bath size={16} color="#f59e0b" />
              <Text className="text-xs font-bold text-zinc-700 ml-1.5">{property.bathrooms} Baths</Text>
            </View>
            <View className="flex-row items-center bg-zinc-50 px-2.5 py-1.5 rounded-lg">
              <Square size={16} color="#f59e0b" />
              <Text className="text-xs font-bold text-zinc-700 ml-1.5">{property.area_sqft} sqft</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
