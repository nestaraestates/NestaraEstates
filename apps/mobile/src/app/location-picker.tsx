import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { ChevronLeft, Navigation, MapPin } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export default function LocationPickerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [addressName, setAddressName] = useState('Move map to select location');
  const [region, setRegion] = useState<Region>({
    latitude: 12.9716, // Default Bangalore
    longitude: 77.5946,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (geocode.length > 0) {
        const place = geocode[0];
        const name = [place.district, place.city, place.region].filter(Boolean).join(', ');
        setAddressName(name || 'Unknown Location');
      }
    } catch (error) {
      console.log('Geocode error:', error);
    }
  };

  const handleDetectLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions in your settings.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      await reverseGeocode(newRegion.latitude, newRegion.longitude);
    } catch (error) {
      Alert.alert('Error', 'Could not detect location.');
    }
    setLoading(false);
  };

  const handleRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);
    await reverseGeocode(newRegion.latitude, newRegion.longitude);
  };

  const handleConfirm = async () => {
    try {
      // 1. Save locally for instant load
      await AsyncStorage.setItem('user_location', addressName);
      await AsyncStorage.setItem('user_location_lat', region.latitude.toString());
      await AsyncStorage.setItem('user_location_lng', region.longitude.toString());
      
      // 2. Save to Supabase Profile for cross-device sync
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        // We save it to 'preferred_cities' as an array with this city as the primary
        await supabase.from('profiles').update({ 
          preferred_cities: [addressName] 
        }).eq('id', session.user.id);
      }

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Could not save location');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <SafeAreaView edges={['top']} className="bg-white z-10 shadow-sm shadow-zinc-200 absolute top-0 w-full">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
            <ChevronLeft size={24} color="#18181B" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-zinc-900">Choose Location</Text>
        </View>
      </SafeAreaView>

      {/* Map */}
      <View className="flex-1">
        <MapView 
          style={{ flex: 1 }}
          region={region}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={true}
        />
        
        {/* Center Pin Marker (Fixed in center of map) */}
        <View className="absolute top-1/2 left-1/2 -mt-8 -ml-4" pointerEvents="none">
          <MapPin size={32} color="#DC2626" fill="#DC2626" />
        </View>

        {/* Floating Auto-Detect Button */}
        <TouchableOpacity 
          onPress={handleDetectLocation}
          disabled={loading}
          className="absolute bottom-6 right-4 bg-white p-4 rounded-full shadow-lg shadow-zinc-900/20 items-center justify-center border border-zinc-100"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : (
            <Navigation size={24} color="#059669" />
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Action Panel */}
      <SafeAreaView edges={['bottom']} className="bg-white border-t border-zinc-200 p-4">
        <Text className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Selected Location</Text>
        <Text className="text-lg font-semibold text-zinc-900 mb-4" numberOfLines={2}>
          {addressName}
        </Text>
        
        <TouchableOpacity 
          onPress={handleConfirm}
          className="bg-brand-500 py-4 rounded-2xl items-center shadow-sm"
        >
          <Text className="text-white font-bold text-base">Confirm Location</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
