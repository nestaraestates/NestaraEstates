import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useCompareStore } from '@/store/compare';
import { ArrowLeft, Trash2, MapPin, Bed, Bath, Square, Building2, Check, X } from 'lucide-react-native';
import { formatIndianCurrency } from '@/utils/format';

export default function CompareScreen() {
  const router = useRouter();
  const compareIds = useCompareStore((state) => state.compareIds);
  const toggleCompare = useCompareStore((state) => state.toggleCompare);
  const clearCompare = useCompareStore((state) => state.clearCompare);
  
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, [compareIds]);

  const fetchProperties = async () => {
    if (compareIds.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('properties')
      .select('*, property_media(url, media_type)')
      .in('id', compareIds);
    setProperties(data || []);
    setLoading(false);
  };

  const getPrimaryImage = (property: any) => {
    const images = property.property_media?.filter((m: any) => m.media_type === 'IMAGE');
    if (images && images.length > 0) return images[0].url;
    return null;
  };

  const renderRow = (label: string, icon: any, key: string, format?: (val: any) => string) => (
    <View className="flex-row border-b border-slate-100 py-3">
      <View className="w-32 justify-center pl-2">
        <Text className="text-xs font-bold text-slate-500 uppercase">{label}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
        <View className="flex-row">
          {properties.map((prop) => (
            <View key={prop.id} className="w-40 px-2 justify-center border-l border-slate-100">
              <View className="flex-row items-center">
                {icon && <View className="mr-1.5 opacity-50">{icon}</View>}
                <Text className="text-sm font-semibold text-slate-800" numberOfLines={2}>
                  {format ? format(prop[key]) : (prop[key] || '-')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-200">
        <Pressable onPress={() => router.push('/' as any)} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#0f172a" />
        </Pressable>
        <Text className="text-xl font-black text-slate-900 tracking-tight">Compare Properties</Text>
        <Pressable onPress={clearCompare} className="p-2 -mr-2 bg-red-50 rounded-lg">
          <Text className="text-red-600 font-bold text-xs">Clear All</Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : compareIds.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
            <Building2 size={32} color="#cbd5e1" />
          </View>
          <Text className="text-xl font-bold text-slate-800 mb-2">Nothing to compare</Text>
          <Text className="text-center text-slate-500">Go back and add up to 3 properties to compare them side-by-side.</Text>
          <Pressable onPress={() => router.push('/' as any)} className="mt-8 bg-amber-500 px-6 py-3 rounded-full">
            <Text className="text-white font-bold">Browse Properties</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {/* Images Row */}
          <View className="flex-row border-b border-slate-200 pb-4 pt-4">
            <View className="w-32 justify-center pl-4">
              <Text className="text-sm font-bold text-slate-400">Add up to 3 properties</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
              <View className="flex-row">
                {properties.map((prop) => (
                  <View key={prop.id} className="w-40 px-2 relative">
                    <View className="w-full h-32 rounded-xl bg-slate-100 overflow-hidden mb-2">
                      {getPrimaryImage(prop) ? (
                        <Image source={{ uri: getPrimaryImage(prop) }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <View className="flex-1 items-center justify-center"><Image source={require('@/assets/images/logo-sm.png')} className="w-12 h-12 opacity-30" resizeMode="contain" /></View>
                      )}
                    </View>
                    <Pressable 
                      onPress={() => toggleCompare(prop.id)}
                      className="absolute top-4 right-4 bg-red-500 p-1.5 rounded-full border-2 border-white"
                    >
                      <Trash2 size={12} color="white" />
                    </Pressable>
                    <Text className="font-bold text-slate-900 text-sm" numberOfLines={2}>{prop.title}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Details Matrix */}
          <View className="bg-white">
            {renderRow('Price', null, 'price', (v) => formatIndianCurrency(v))}
            {renderRow('Status', null, 'status')}
            {renderRow('Type', <Building2 size={14} color="#64748b"/>, 'type')}
            {renderRow('Purpose', null, 'purpose')}
            {renderRow('City', <MapPin size={14} color="#64748b"/>, 'city')}
            {renderRow('BHK', <Bed size={14} color="#64748b"/>, 'bhk')}
            {renderRow('Baths', <Bath size={14} color="#64748b"/>, 'bathrooms')}
            {renderRow('Area', <Square size={14} color="#64748b"/>, 'area_sqft', (v) => v ? `${v} sq.ft` : '-')}
            
            <View className="flex-row border-b border-slate-100 py-3">
              <View className="w-32 justify-center pl-2">
                <Text className="text-xs font-bold text-slate-500 uppercase">Parking</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                <View className="flex-row">
                  {properties.map((prop) => (
                    <View key={prop.id} className="w-40 px-2 justify-center border-l border-slate-100 items-center">
                      {prop.parking ? <Check size={16} color="#10b981" /> : <X size={16} color="#ef4444" />}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
