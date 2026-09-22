import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, Upload, X, Check, FileText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';
import { parseIndianCurrencyString } from '@/utils/format';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export default function SellScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mapCoords, setMapCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    purpose: 'BUY',
    type: 'House',
    price: '',
    bhk: '',
    bathrooms: '',
    area_sqft: '',
    village: '',
    taluk: '',
    city: '',
    pincode: '',
    state: '',
    coordinates: '',
    negotiable: false,
    owner_name: '',
    owner_phone: ''
  });

  const [images, setImages] = useState<{uri: string, type: string}[]>([]);
  const [deedDoc, setDeedDoc] = useState<any>(null);
  const [taxDoc, setTaxDoc] = useState<any>(null);

  useEffect(() => {
    // Pre-fill owner details
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setFormData(prev => ({
            ...prev,
            owner_name: profile.full_name || '',
            owner_phone: profile.phone_number || ''
          }));
        }
      }
    }
    loadProfile();
  }, []);

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const detectLocation = async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to detect your exact coordinates.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setMapCoords({ lat: location.coords.latitude, lng: location.coords.longitude });
      updateForm('coordinates', `${location.coords.latitude.toFixed(6)},${location.coords.longitude.toFixed(6)}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to detect location.');
    } finally {
      setLoadingLocation(false);
    }
  };

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

            marker.on('dragend', function (e) {
                var coords = e.target.getLatLng();
                window.ReactNativeWebView.postMessage(JSON.stringify({ lat: coords.lat, lng: coords.lng }));
            });

            map.on('click', function(e) {
                marker.setLatLng(e.latlng);
                window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng }));
            });
        </script>
    </body>
    </html>
  `;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });

    if (!result.canceled) {
      setLoading(true);
      try {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg'
        }));
        setImages(prev => [...prev, ...newImages].slice(0, 5));
      } catch (error) {
        console.error("Compression error:", error);
        Alert.alert("Error", "Failed to process images.");
      } finally {
        setLoading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const pickDocument = async (type: 'deed' | 'tax') => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (type === 'deed') setDeedDoc(result.assets[0]);
      else setTaxDoc(result.assets[0]);
    }
  };

  const uploadFileToSupabase = async (uri: string, contentType: string, folder: string) => {
    try {
      const ext = contentType.split('/')[1] || 'jpeg';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const { error } = await supabase.storage.from('media').upload(fileName, blob, {
        contentType,
      });

      if (error) throw error;
      
      const { data } = supabase.storage.from('media').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (e) {
      console.error("Upload error:", e);
      throw e;
    }
  };

  const submitForm = async () => {
    if (!formData.title || !formData.price || !formData.city || images.length === 0) {
      Alert.alert("Error", "Please fill all required fields and upload at least 1 image.");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // 1. Create Property Record
      const rawLocation = [formData.village, formData.taluk, formData.pincode].filter(Boolean).join(', ');
      const finalLocation = formData.coordinates ? `${formData.coordinates}|${rawLocation}` : rawLocation;

      const typeMap: Record<string, string> = {
        'House': 'INDEPENDENT_HOUSE',
        'Villa': 'VILLA',
        'Apartment': 'APARTMENT',
        'Land': 'PLOT',
        'Commercial': 'COMMERCIAL'
      };

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          owner_id: session.user.id,
          title: formData.title,
          description: formData.description,
          purpose: formData.purpose,
          type: typeMap[formData.type] || 'INDEPENDENT_HOUSE',
          price: parseInt(parseIndianCurrencyString(formData.price)) || 0,
          bhk: parseInt(formData.bhk) || null,
          bathrooms: parseInt(formData.bathrooms) || null,
          area_sqft: parseInt(formData.area_sqft) || null,
          location: finalLocation,
          city: formData.city,
          status: 'AVAILABLE',
          is_verified: false
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // 2. Upload Images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        
        // Compress right before upload so UI isn't blocked during selection
        const manipResult = await ImageManipulator.manipulateAsync(
          img.uri,
          [{ resize: { width: 1080 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        const url = await uploadFileToSupabase(manipResult.uri, 'image/jpeg', 'properties');
        await supabase.from('property_media').insert({
          property_id: property.id,
          url,
          media_type: 'IMAGE',
          is_featured: i === 0
        });
      }

      // 3. Upload Documents
      if (deedDoc) {
        const url = await uploadFileToSupabase(deedDoc.uri, deedDoc.mimeType || 'application/pdf', 'documents');
        await supabase.from('property_media').insert({
          property_id: property.id,
          url,
          media_type: 'DOCUMENT',
          is_featured: false
        });
      }

      if (taxDoc) {
        const url = await uploadFileToSupabase(taxDoc.uri, taxDoc.mimeType || 'application/pdf', 'documents');
        await supabase.from('property_media').insert({
          property_id: property.id,
          url,
          media_type: 'DOCUMENT',
          is_featured: false
        });
      }

      Alert.alert("Success!", "Property submitted for verification.", [
        { text: "OK", onPress: () => router.replace('/(tabs)') }
      ]);

    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to list property");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.title) return Alert.alert("Required", "Please enter a title");
      if (!formData.village || !formData.taluk || !formData.city || !formData.pincode || !formData.state) {
        return Alert.alert("Required", "Please fill out all location fields.");
      }
    }
    if (step === 2 && !formData.price) return Alert.alert("Required", "Please enter a price");
    if (step === 3 && images.length === 0) return Alert.alert("Required", "Please upload at least 1 photo.");
    
    setStep(step + 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900 mb-6">Property Information</Text>
            
            <Text className="text-sm font-medium text-slate-700 mb-1">Property Title *</Text>
            <TextInput
              value={formData.title}
              onChangeText={(t) => updateForm('title', t)}
              placeholder="e.g. Modern 3BHK in Downtown"
              className="bg-white border border-slate-200 p-4 rounded-xl mb-4 text-slate-900"
            />

            <View className="flex-row space-x-4 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-slate-700 mb-1">Property Type</Text>
                <View className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row p-1">
                    {['House', 'Villa', 'Apartment', 'Land', 'Commercial'].map((t) => (
                      <Pressable key={t} onPress={() => updateForm('type', t)} className={`px-3 py-2 rounded-lg ${formData.type === t ? 'bg-amber-100' : ''}`}>
                        <Text className={`${formData.type === t ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>{t}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-slate-700 mb-1">Purpose</Text>
                <View className="flex-row bg-white border border-slate-200 rounded-xl p-1">
                  {['BUY', 'RENT'].map((p) => (
                    <Pressable key={p} onPress={() => updateForm('purpose', p)} className={`flex-1 items-center justify-center py-2 rounded-lg ${formData.purpose === p ? 'bg-amber-100' : ''}`}>
                      <Text className={`${formData.purpose === p ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>{p === 'BUY' ? 'For Sale' : 'For Rent'}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <Text className="text-sm font-medium text-slate-700 mb-1">Village / Area / Landmark *</Text>
            <TextInput
              value={formData.village}
              onChangeText={(t) => updateForm('village', t)}
              placeholder="e.g. Tavarekere"
              className="bg-white border border-slate-200 p-4 rounded-xl mb-4 text-slate-900"
            />

            <Text className="text-sm font-medium text-slate-700 mb-1">Taluk *</Text>
            <TextInput
              value={formData.taluk}
              onChangeText={(t) => updateForm('taluk', t)}
              placeholder="e.g. Hosakote"
              className="bg-white border border-slate-200 p-4 rounded-xl mb-4 text-slate-900"
            />

            <Text className="text-sm font-medium text-slate-700 mb-1">City / District *</Text>
            <TextInput
              value={formData.city}
              onChangeText={(t) => updateForm('city', t)}
              placeholder="e.g. Bengaluru"
              className="bg-white border border-slate-200 p-4 rounded-xl mb-4 text-slate-900"
            />

            <Text className="text-sm font-medium text-slate-700 mb-1">Pincode *</Text>
            <TextInput
              value={formData.pincode}
              onChangeText={(t) => updateForm('pincode', t)}
              placeholder="e.g. 562114"
              keyboardType="numeric"
              className="bg-white border border-slate-200 p-4 rounded-xl mb-4 text-slate-900"
            />

            <Text className="text-sm font-medium text-slate-700 mb-1">State *</Text>
            <TextInput
              value={formData.state}
              onChangeText={(t) => updateForm('state', t)}
              placeholder="e.g. Karnataka"
              className="bg-white border border-slate-200 p-4 rounded-xl mb-6 text-slate-900"
            />

            <Text className="text-sm font-bold text-slate-900 mb-2">Exact Map Coordinates (Hidden from Public)</Text>
            <Text className="text-xs text-slate-500 mb-4">Drag the map and click to pinpoint your exact location.</Text>
            
            <Pressable 
              onPress={detectLocation}
              disabled={loadingLocation}
              className="flex-row items-center justify-center bg-white border border-slate-200 py-3 rounded-xl mb-4"
            >
              {loadingLocation ? <ActivityIndicator size="small" color="#0f172a" /> : <MapPin size={18} color="#0f172a" />}
              <Text className="font-semibold text-slate-900 ml-2">Detect My Location</Text>
            </Pressable>

            <View className="h-64 bg-slate-200 rounded-xl overflow-hidden mb-4 border border-slate-200">
              <WebView
                source={{ html: getLeafletHTML(mapCoords.lat, mapCoords.lng) }}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    updateForm('coordinates', `${data.lat.toFixed(6)},${data.lng.toFixed(6)}`);
                    setMapCoords({ lat: data.lat, lng: data.lng });
                  } catch (e) {}
                }}
                scrollEnabled={false}
              />
            </View>
            <TextInput
              value={formData.coordinates}
              onChangeText={(t) => updateForm('coordinates', t)}
              placeholder="12.9716, 77.5946"
              editable={false}
              className="bg-slate-100 border border-slate-200 p-4 rounded-xl mb-6 text-slate-600 font-mono text-sm text-center"
            />

            <View className="flex-row space-x-2 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-slate-700 mb-1">BHK</Text>
                <TextInput
                  value={formData.bhk}
                  onChangeText={(t) => updateForm('bhk', t)}
                  placeholder="e.g. 2"
                  keyboardType="numeric"
                  className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-slate-700 mb-1">Area (Sq.ft)</Text>
                <TextInput
                  value={formData.area_sqft}
                  onChangeText={(t) => updateForm('area_sqft', t)}
                  placeholder="e.g. 1200"
                  keyboardType="numeric"
                  className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-slate-700 mb-1">Bathrooms</Text>
                <TextInput
                  value={formData.bathrooms}
                  onChangeText={(t) => updateForm('bathrooms', t)}
                  placeholder="e.g. 2"
                  keyboardType="numeric"
                  className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900"
                />
              </View>
            </View>

            <Text className="text-sm font-medium text-slate-700 mb-1">Property Description</Text>
            <TextInput
              value={formData.description}
              onChangeText={(t) => updateForm('description', t)}
              placeholder="Describe the key features, nearby amenities, and highlights of your property..."
              multiline
              numberOfLines={4}
              className="bg-white border border-slate-200 p-4 rounded-xl mb-4 text-slate-900 h-32"
              textAlignVertical="top"
            />
          </View>
        );
      
      case 2:
        return (
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900 mb-6">Pricing</Text>
            
            <Text className="text-sm font-medium text-slate-700 mb-1">Price (₹) *</Text>
            <TextInput
              value={formData.price}
              onChangeText={(t) => updateForm('price', t)}
              placeholder="e.g. 50L or 2Cr"
              keyboardType="default"
              className="bg-white border border-slate-200 p-4 rounded-xl mb-4 text-slate-900"
            />

            <Pressable 
              onPress={() => setFormData(prev => ({ ...prev, negotiable: !prev.negotiable }))}
              className="flex-row items-center mb-6"
            >
              <View className={`w-6 h-6 rounded border items-center justify-center mr-3 ${formData.negotiable ? 'bg-amber-500 border-amber-500' : 'border-slate-300'}`}>
                {formData.negotiable && <Check size={16} color="white" />}
              </View>
              <Text className="text-slate-700 font-medium">Price is Negotiable</Text>
            </Pressable>
          </View>
        );

      case 3:
        return (
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900 mb-6">Photos & Media</Text>
            
            <Text className="text-sm font-medium text-slate-700 mb-2">Property Photos (Max 5) *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 h-32">
              {images.map((img, index) => (
                <View key={index} className="mr-3 relative h-24 w-24">
                  <Image source={{ uri: img.uri }} className="w-24 h-24 rounded-xl" />
                  <Pressable 
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 z-10"
                  >
                    <X size={12} color="white" />
                  </Pressable>
                </View>
              ))}
              {images.length < 5 && (
                <Pressable 
                  onPress={pickImage}
                  className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl items-center justify-center"
                >
                  <Upload size={24} color="#94a3b8" />
                  <Text className="text-xs text-slate-500 mt-2">Add Photo</Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        );

      case 4:
        return (
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900 mb-6">Documents (Verification)</Text>
            
            <Text className="text-sm font-medium text-slate-700 mb-2">Legal Documents</Text>
            
            <Pressable 
              onPress={() => pickDocument('deed')}
              className="flex-row items-center justify-between bg-white border border-slate-200 p-4 rounded-xl mb-3"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <FileText size={20} color={deedDoc ? "#10b981" : "#64748b"} />
                <Text className={`ml-3 ${deedDoc ? 'text-emerald-600 font-medium' : 'text-slate-600'}`} numberOfLines={1}>
                  {deedDoc ? deedDoc.name : 'Upload Deed/Title Document'}
                </Text>
              </View>
              <Upload size={16} color="#94a3b8" />
            </Pressable>

            <Pressable 
              onPress={() => pickDocument('tax')}
              className="flex-row items-center justify-between bg-white border border-slate-200 p-4 rounded-xl mb-6"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <FileText size={20} color={taxDoc ? "#10b981" : "#64748b"} />
                <Text className={`ml-3 ${taxDoc ? 'text-emerald-600 font-medium' : 'text-slate-600'}`} numberOfLines={1}>
                  {taxDoc ? taxDoc.name : 'Upload Latest Tax Receipt'}
                </Text>
              </View>
              <Upload size={16} color="#94a3b8" />
            </Pressable>

          </View>
        );

      case 5:
        return (
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900 mb-6">Owner Details</Text>
            
            <Text className="text-sm font-medium text-slate-700 mb-1">Owner Name</Text>
            <TextInput
              value={formData.owner_name}
              onChangeText={(t) => updateForm('owner_name', t)}
              placeholder="John Doe"
              className="bg-white border border-slate-200 p-4 rounded-xl mb-4 text-slate-900"
            />

            <Text className="text-sm font-medium text-slate-700 mb-1">Owner Phone</Text>
            <TextInput
              value={formData.owner_phone}
              onChangeText={(t) => updateForm('owner_phone', t)}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              className="bg-white border border-slate-200 p-4 rounded-xl mb-4 text-slate-900"
            />
            
            <View className="bg-blue-50 p-4 rounded-xl mt-4 border border-blue-100">
              <Text className="text-blue-800 text-sm font-medium">
                By submitting, your property will be reviewed by our team for verification before being publicly listed.
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Header */}
            <View className="px-4 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white">
              {step > 1 ? (
                <Pressable onPress={() => setStep(step - 1)} className="p-2 -ml-2">
                  <ChevronLeft size={24} color="#0f172a" />
                </Pressable>
              ) : (
                <View className="w-10" />
              )}
              <Text className="text-lg font-bold text-slate-900">List Property ({step}/5)</Text>
              <View className="w-10" />
            </View>

            {/* Progress Bar */}
            <View className="h-1 bg-slate-200 w-full">
              <View className="h-1 bg-amber-500" style={{ width: `${(step / 5) * 100}%` }} />
            </View>

            <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
              {renderStep()}
              <View className="h-10" />
            </ScrollView>

            {/* Footer */}
            <View className="p-4 bg-white border-t border-slate-200">
              {step < 5 ? (
                <Pressable 
                  onPress={nextStep}
                  className="bg-amber-500 p-4 rounded-xl items-center justify-center flex-row"
                >
                  <Text className="text-white font-bold text-lg mr-2">Next Step</Text>
                  <ChevronRight size={20} color="white" />
                </Pressable>
              ) : (
                <Pressable 
                  onPress={submitForm}
                  disabled={loading}
                  className={`${loading ? 'bg-amber-300' : 'bg-amber-500'} p-4 rounded-xl items-center justify-center flex-row`}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Check size={20} color="white" />
                      <Text className="text-white font-bold text-lg ml-2">Submit Listing</Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
