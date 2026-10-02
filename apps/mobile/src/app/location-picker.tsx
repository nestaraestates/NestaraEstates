import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { ChevronLeft, Navigation, MapPin } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export default function LocationPickerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [addressName, setAddressName] = useState('Move map to select location');
  const getLeafletHTML = (lat: number, lng: number) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { padding: 0; margin: 0; }
            html, body, #map { height: 100%; width: 100vw; }
            .target-icon {
                position: absolute;
                bottom: 20px;
                right: 20px;
                background: white;
                padding: 10px;
                border-radius: 50%;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 1000;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map').setView([${lat}, ${lng}], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

            function sendLocation(lat, lng) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lat, lng: lng }));
            }

            marker.on('dragend', function (e) {
                var coords = e.target.getLatLng();
                sendLocation(coords.lat, coords.lng);
            });

            map.on('click', function(e) {
                marker.setLatLng(e.latlng);
                sendLocation(e.latlng.lat, e.latlng.lng);
            });
            
            // Allow reacting to location updates from React Native
            window.updateMapLocation = function(newLat, newLng) {
                map.setView([newLat, newLng], 13);
                marker.setLatLng([newLat, newLng]);
            };
        </script>
    </body>
    </html>
  `;
  
  const [region, setRegion] = useState({ latitude: 12.9716, longitude: 77.5946 });
  const webViewRef = React.useRef<WebView>(null);

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
      setRegion({ latitude: newRegion.latitude, longitude: newRegion.longitude });
      webViewRef.current?.injectJavaScript(`window.updateMapLocation(${newRegion.latitude}, ${newRegion.longitude}); true;`);
      await reverseGeocode(newRegion.latitude, newRegion.longitude);
    } catch (error) {
      Alert.alert('Error', 'Could not detect location.');
    }
    setLoading(false);
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
        <WebView
          ref={webViewRef}
          style={{ flex: 1 }}
          source={{ html: getLeafletHTML(region.latitude, region.longitude) }}
          onMessage={async (event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              setRegion({ latitude: data.lat, longitude: data.lng });
              await reverseGeocode(data.lat, data.lng);
            } catch (e) {}
          }}
          scrollEnabled={false}
        />

        {/* Floating Auto-Detect Button */}
        <TouchableOpacity 
          onPress={handleDetectLocation}
          disabled={loading}
          className="absolute bottom-6 right-4 bg-white px-5 py-3 rounded-full shadow-lg shadow-zinc-900/30 flex-row items-center justify-center border border-zinc-100"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : (
            <>
              <Navigation size={20} color="#059669" />
              <Text className="text-emerald-600 font-bold ml-2">Detect My Location</Text>
            </>
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
