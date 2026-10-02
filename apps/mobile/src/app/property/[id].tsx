import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, Pressable, Linking, Alert, Modal, TextInput, Share, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { formatLocation, formatIndianCurrency } from '@/utils/format';
import { WebView } from 'react-native-webview';
import { MapPin, WifiOff, Bed, Bath, Square, ChevronLeft, Calendar, Info, Phone, MessageSquare, ShieldCheck, Heart, Share2, Bookmark, Maximize2, X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react-native';
import { FinancialTools } from '@/components/FinancialTools';


const mapHtml = (lat: number, lng: number) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lng}], 15);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(map);
        L.marker([${lat}, ${lng}]).addTo(map);
      </script>
    </body>
  </html>
`;

export default function PropertyDetailsScreen() {

 const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
 const router = useRouter();
 const handleDelete = () => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to permanently delete this property listing? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.from('properties').update({ is_deleted: true, status: 'DELETED' }).eq('id', id);
            if (error) {
              Alert.alert("Error", error.message);
            } else {
              Alert.alert("Deleted", "Your property has been successfully deleted.", [
                { text: "OK", onPress: () => { if(router.canGoBack()) router.back(); else router.push('/settings' as any); } }
              ]);
            }
          }
        }
      ]
    );
  };

 const [property, setProperty] = useState<any>(null);
  const [fullScreenIndex, setFullScreenIndex] = useState<number | null>(null);
 const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);
 const [currentUserId, setCurrentUserId] = useState<string | null>(null);
 const [currentUserCustomId, setCurrentUserCustomId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
 const [isFavorited, setIsFavorited] = useState(false);
 const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
 const [existingEnquiryId, setExistingEnquiryId] = useState<string | null>(null);
 const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', address: '', message: '' });
 const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

 useEffect(() => {
 const fetchProperty = async () => {
  try {
    setHasError(false);
    setLoading(true);
 const { data: { session } } = await supabase.auth.getSession();
 
 let userId = null;
 if (session) {
   userId = session.user.id;
   setCurrentUserId(userId);
   const { data: profile } = await supabase.from('profiles').select('role, custom_id, full_name, email, phone_number, address').eq('id', userId).single();
   if (profile?.custom_id) setCurrentUserCustomId(profile.custom_id);
   if (profile?.role === 'ADMIN') setIsAdmin(true);
   
   setEnquiryForm({
     name: profile?.full_name || '',
     email: profile?.email || '',
     phone: profile?.phone_number || '+91 ',
     address: profile?.address || '',
     message: ''
   });
 }

 const [propRes, favRes, enqRes] = await Promise.all([
 supabase
 .from('properties')
 .select(`
 *,
 owner:owner_id (id, full_name, email, phone_number, avatar_url),
 property_media (url, media_type)
 `)
 .eq('id', id)
 .single(),
 userId ? supabase.from('saved_properties').select('id').eq('user_id', userId).eq('property_id', id).single() : Promise.resolve({ data: null }),
 userId ? supabase.from('enquiries').select('id').eq('user_id', userId).eq('property_id', id).single() : Promise.resolve({ data: null })
 ]);
    
    setProperty(propRes.data);
    if (favRes.data) setIsFavorited(true);
    if (enqRes.data) setExistingEnquiryId(enqRes.data.id);
  } catch (e) {
    setHasError(true);
  } finally {
    setLoading(false);
  }
};

fetchProperty();
 }, [id, retryCount]);

 
  const submitEnquiry = async () => {
    if (!currentUserId) {
      Alert.alert('Login Required', 'You must be logged in to apply for an enquiry.');
      return;
    }
    if (!enquiryForm.message.trim()) {
      Alert.alert('Error', 'Please enter a message.');
      return;
    }
    
    setIsSubmittingEnquiry(true);
    
    const { data: existing } = await supabase
      .from('enquiries')
      .select('id')
      .eq('property_id', id)
      .eq('user_id', currentUserId)
      .single();
      
    let activeEnquiryId = existing?.id;
    
    if (!activeEnquiryId) {
      const { data: newEnq, error: enqError } = await supabase.from('enquiries').insert({
        property_id: id,
        user_id: currentUserId,
        name: enquiryForm.name,
        email: enquiryForm.email,
        phone: enquiryForm.phone,
        address: enquiryForm.address,
        message: enquiryForm.message,
        status: 'PENDING'
      }).select().single();
      
      if (enqError) {
        Alert.alert('Error', 'Failed to submit enquiry.');
        setIsSubmittingEnquiry(false);
        return;
      }
      activeEnquiryId = newEnq.id;
    }
    
    await supabase.from('messages').insert({
      enquiry_id: activeEnquiryId,
      sender_id: currentUserId,
      message: enquiryForm.message
    });
    
    setIsSubmittingEnquiry(false);
    setShowEnquiryModal(false);
    router.push(`/chat/buyer/${activeEnquiryId}` as any);
  };


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

  const isOwner = currentUserId === property?.owner_id;
  const showMap = isOwner || isAdmin;
  
  let mapLat = 12.9716;
  let mapLng = 77.5946;
  if (property?.location && property.location.includes('|')) {
    const coords = property.location.split('|')[0].split(',');
    if (coords.length === 2) {
      mapLat = parseFloat(coords[0]);
      mapLng = parseFloat(coords[1]);
    }
  }

  const getReadOnlyLeafletHTML = (lat: number, lng: number) => `
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
            var map = L.map('map', { zoomControl: false, dragging: false, scrollWheelZoom: false }).setView([${lat}, ${lng}], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            L.marker([${lat}, ${lng}]).addTo(map);
        </script>
    </body>
    </html>
  `;

  return (

 <View className="flex-1 justify-center items-center bg-surface-100 ">
 <ActivityIndicator size="large" />
 </View>
 );
 }

 
  if (hasError) {
    return (
      <SafeAreaView className="flex-1 bg-surface-100 justify-center items-center px-6 relative">
        <View className="absolute top-4 left-4 z-10">
          <Pressable onPress={() => router.back()} className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-zinc-100">
            <ChevronLeft size={24} color="#18181b" />
          </Pressable>
        </View>
        <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-6">
          <WifiOff size={40} color="#ef4444" />
        </View>
        <Text className="text-2xl font-bold text-surface-900 mb-2 text-center">Connection Failed</Text>
        <Text className="text-zinc-500 text-center px-4 mb-8 text-sm">We couldn't connect to the server. Please check your internet connection and try again.</Text>
        <Pressable onPress={() => setRetryCount(c => c + 1)} className="bg-brand-500 px-8 py-3 rounded-xl shadow-sm">
          <Text className="text-white font-bold text-base">Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!property) {
 return (
 <View className="flex-1 justify-center items-center bg-surface-100 ">
 <Text className="text-zinc-500">Property not found.</Text>
 </View>
 );
 }

 const images = property.property_media?.filter((m: any) => m.media_type === 'IMAGE').map((m: any) => m.url) || [];
  if (images.length === 0) images.push('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop');


  const shareProperty = async () => {
    if (!property) return;
    try {
      let loc = property.location;
      if (loc && loc.includes('|')) loc = loc.split('|')[0];
      await Share.share({
        message: `Check out this amazing ${property.bhk} BHK ${property.type} in ${loc}, ${property.city} listed for ${formatIndianCurrency(property.price)} on Nestara Estates!`,
        title: 'Nestara Estates Property',
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View className="flex-1 bg-surface-100">
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1 bg-surface-100" bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* HERO IMAGE CAROUSEL */}
        <View className="relative w-full h-96 bg-zinc-100">
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} className="w-full h-full">
            {images.map((url: string, index: number) => (
              <Pressable key={index} onPress={() => setFullScreenIndex(index)} style={{ width: require('react-native').Dimensions.get('window').width, height: '100%' }}>
                <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
              </Pressable>
            ))}
          </ScrollView>
          
          {/* Top Floating Header */}
          <View className="absolute w-full flex-row justify-between items-center px-4" style={{ top: insets.top + 16 }}>
            <Pressable onPress={() => { if(router.canGoBack()) router.back(); else router.push('/' as any); }} className="w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md">
              <ChevronLeft size={24} color="white" />
            </Pressable>
            <View className="flex-row space-x-3">
              <Pressable onPress={shareProperty} className="w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md">
                <Share2 size={20} color="white" />
              </Pressable>
              <Pressable 
                onPress={async () => {
                  if (!currentUserId) return Alert.alert("Login Required", "Please login to save properties.");
                  const newState = !isFavorited;
                  setIsFavorited(newState);
                  if (newState) {
                    await supabase.from('saved_properties').insert([{ user_id: currentUserId, property_id: property.id }]);
                  } else {
                    await supabase.from('saved_properties').delete().eq('user_id', currentUserId).eq('property_id', property.id);
                  }
                }}
                className="w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md"
              >
                <Heart size={20} color={isFavorited ? "#ef4444" : "white"} fill={isFavorited ? "#ef4444" : "transparent"} />
              </Pressable>
            </View>
          </View>

          {/* Swipe Indicator Pill */}
          {images.length > 1 && (
            <View pointerEvents="none" className="absolute bottom-10 right-4 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md flex-row items-center">
              <Maximize2 size={12} color="white" />
              <Text className="text-white text-xs font-bold ml-1.5">1/{images.length}</Text>
            </View>
          )}
        </View>

        {/* OVERLAPPING CONTENT SHEET */}
        <View className="-mt-6 bg-surface-100 rounded-t-2xl px-6 pt-6 pb-40 shadow-sm min-h-[600px]">
          
          {/* Tags */}
          <Animated.View entering={FadeInDown.duration(300)} className="flex-row items-center mb-4 space-x-2">
            <View className="bg-brand-500/10 px-3 py-1 rounded-md border border-brand-500/20">
              <Text className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">{property.purpose === 'RENT' ? 'FOR RENT' : 'FOR SALE'}</Text>
            </View>
            <View className="bg-zinc-100 px-3 py-1 rounded-md border border-zinc-200">
              <Text className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{property.type}</Text>
            </View>
          </Animated.View>

          {/* Title & Location */}
          <Animated.View entering={FadeInDown.duration(300)}>
            <Text className="text-2xl font-bold text-surface-900 mb-2 leading-8">{property.title}</Text>
            <View className="flex-row items-center mb-6">
              <MapPin size={16} color="#71717a" />
              <Text className="text-sm font-medium text-zinc-500 ml-1.5 flex-1">{formatLocation(property.location)}, {property.city}</Text>
            </View>
          </Animated.View>

          {/* Price & Verified Header */}
          <Animated.View entering={FadeInDown.duration(300)} className="flex-row justify-between items-end mb-6 border-b border-zinc-100 pb-6">
            <View>
              <Text className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{property.purpose === 'RENT' ? 'MONTHLY RENT' : 'ASKING PRICE'}</Text>
              <Text className="text-3xl font-bold text-brand-500">
                {formatIndianCurrency(property.price)}
              </Text>
            </View>
            {property.is_verified ? (
              <View className="flex-row items-center bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <ShieldCheck size={14} color="#10b981" />
                <Text className="text-[10px] font-bold text-emerald-700 ml-1.5 uppercase tracking-wider">Verified</Text>
              </View>
            ) : (
              <View className="flex-row items-center bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
                <ShieldCheck size={14} color="#71717a" />
                <Text className="text-[10px] font-bold text-zinc-600 ml-1.5 uppercase tracking-wider">Unverified</Text>
              </View>
            )}
          </Animated.View>

          {/* Key Specs */}
          <Animated.View entering={FadeInDown.duration(300)} className="flex-row items-center bg-surface-100 rounded-xl p-4 mb-8 border border-zinc-100 shadow-sm justify-between px-6">
            <View className="items-center">
              <Bed size={22} className="text-brand-500 mb-2" />
              <Text className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Beds</Text>
              <Text className="text-lg font-bold text-surface-900">{property.bhk}</Text>
            </View>
            <View className="w-px h-10 bg-zinc-100" />
            <View className="items-center">
              <Bath size={22} className="text-brand-500 mb-2" />
              <Text className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Baths</Text>
              <Text className="text-lg font-bold text-surface-900">{property.bathrooms}</Text>
            </View>
            <View className="w-px h-10 bg-zinc-100" />
            <View className="items-center">
              <Square size={22} className="text-brand-500 mb-2" />
              <Text className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Sq.Ft</Text>
              <Text className="text-lg font-bold text-surface-900">{property.area_sqft}</Text>
            </View>
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInDown.duration(300)} className="mb-8">
            <Text className="text-lg font-bold text-surface-900 mb-3">About this property</Text>
            <Text className="text-sm text-zinc-600 leading-6">{property.description}</Text>
          </Animated.View>

          {/* Verification Status */}
          <Animated.View entering={FadeInDown.duration(300)} className="mb-8">
            <Text className="text-lg font-bold text-surface-900 mb-3">Verification Check</Text>
            <View className={`p-4 rounded-xl border ${property.is_verified ? 'bg-emerald-50/50 border-emerald-100' : 'bg-zinc-50 border-zinc-100'}`}>
              <View className="flex-row items-center mb-4 pb-3 border-b border-black/5">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${property.is_verified ? 'bg-emerald-100' : 'bg-zinc-200'}`}>
                  <ShieldCheck size={20} color={property.is_verified ? "#059669" : "#71717A"} />
                </View>
                <View>
                  <Text className={`text-base font-bold ${property.is_verified ? 'text-emerald-900' : 'text-surface-900'}`}>
                    {property.is_verified ? 'Fully Verified' : 'Verification Pending'}
                  </Text>
                  <Text className={`text-xs font-medium mt-0.5 ${property.is_verified ? 'text-emerald-700' : 'text-zinc-500'}`}>
                    {property.is_verified ? 'All legal documents checked' : 'Checks are in progress'}
                  </Text>
                </View>
              </View>
              
              {(() => {
                const checks = property.verification_checks || { 
                  title_document: property.is_verified ? 'Verified' : 'Pending', 
                  identity_verification: property.is_verified ? 'Verified' : 'Pending', 
                  encumbrances: property.is_verified ? 'Verified' : 'Pending', 
                  tax_receipts: property.is_verified ? 'Verified' : 'Pending' 
                };
                
                const labels: Record<string, string> = {
                  title_document: 'Title Document',
                  identity_verification: 'Identity Verification',
                  encumbrances: 'Encumbrances Check',
                  tax_receipts: 'Tax Receipts'
                };
                
                return (
                  <View className="space-y-3">
                    {Object.entries(checks).map(([key, value]) => {
                      const isVerified = value === 'Verified';
                      const isPending = value === 'Pending';
                      return (
                        <View key={key} className="flex-row items-center justify-between">
                          <Text className="font-medium text-zinc-700 text-sm">
                            {labels[key] || key}
                          </Text>
                          <View className="flex-row items-center">
                            <Text className={`mr-2 text-xs font-bold uppercase tracking-wider ${isVerified ? 'text-emerald-600' : isPending ? 'text-amber-600' : 'text-red-600'}`}>
                              {String(value)}
                            </Text>
                            {isVerified ? (
                              <CheckCircle size={16} color="#059669" />
                            ) : isPending ? (
                              <ShieldCheck size={16} color="#D97706" />
                            ) : (
                              <XCircle size={16} color="#DC2626" />
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })()}
            </View>
          </Animated.View>

          {/* Location Map Placeholder */}
          <Animated.View entering={FadeInDown.duration(300)} className="mb-8">
            <Text className="text-lg font-bold text-surface-900 mb-3">Location</Text>
            <View className="w-full h-56 bg-zinc-50 rounded-xl overflow-hidden items-center justify-center border border-zinc-100 relative">
              <View className="absolute inset-0 bg-blue-50/30" />
              <View className="bg-white p-5 rounded-xl items-center shadow-sm w-4/5 border border-zinc-100 z-10">
                <View className="w-12 h-12 bg-brand-500/10 rounded-full items-center justify-center mb-3">
                  <MapPin size={24} className="text-brand-500" />
                </View>
                <Text className="font-bold text-surface-900 text-base mb-1">Location Protected</Text>
                <Text className="text-xs text-center text-zinc-500 mb-4 leading-5">To protect the seller's privacy, the exact map pin is hidden.</Text>
                <Pressable onPress={() => setShowContactOptions(true)} className="w-full bg-surface-900 rounded-lg py-2 items-center">
                  <Text className="text-white font-bold text-sm">Contact Agent</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Financial Tools */}
          <Animated.View entering={FadeInDown.duration(300)}>
            <Text className="text-lg font-bold text-surface-900 mb-3">Financial Tools</Text>
            <View className="-mx-1">
              <FinancialTools propertyPrice={property.price} purpose={property.purpose || "BUY"} />
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* STICKY FOOTER ACTION BAR */}
      <Animated.View entering={FadeInUp.duration(300)} className="absolute bottom-0 w-full bg-surface-100/95 backdrop-blur-3xl border-t border-zinc-200 px-5 pt-3 pb-6 flex-row items-center shadow-sm" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        <Pressable 
          className="flex-1 bg-brand-500 rounded-xl py-3.5 items-center justify-center flex-row shadow-sm"
          onPress={async () => {
              try {
                if (!currentUserId) {
                  Alert.alert("Login Required", "Please login to contact the agent.");
                  return;
                }
                setShowContactOptions(true);
              } catch(e){}
          }}
        >
          <MessageSquare size={18} color="white" />
          <Text className="text-white font-bold text-base ml-2">Contact Agent</Text>
        </Pressable>
      </Animated.View>

      {/* FULLSCREEN IMAGE VIEWER */}
      <Modal visible={fullScreenIndex !== null} transparent={true} animationType="fade" onRequestClose={() => setFullScreenIndex(null)}>
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            <View className="flex-row justify-between items-center px-4 pt-4 z-50 absolute w-full" style={{ top: insets.top + 16 }}>
              <Text className="text-white font-bold text-lg shadow-black drop-shadow-md">
                {fullScreenIndex !== null ? fullScreenIndex + 1 : 1} / {images.length}
              </Text>
              <Pressable 
                onPress={() => setFullScreenIndex(null)}
                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md"
              >
                <X size={24} color="white" />
              </Pressable>
            </View>
            
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false} 
              className="flex-1"
              contentOffset={{ x: fullScreenIndex !== null ? fullScreenIndex * require('react-native').Dimensions.get('window').width : 0, y: 0 }}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / require('react-native').Dimensions.get('window').width);
                setFullScreenIndex(index);
              }}
            >
              {images.map((url: string, index: number) => (
                <View key={index} style={{ width: require('react-native').Dimensions.get('window').width, height: '100%', justifyContent: 'center' }}>
                  <Image 
                    source={{ uri: url }} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain" 
                  />
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      
      {/* Custom Contact Options Modal */}
      <Modal
        visible={showContactOptions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContactOptions(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-surface-100 rounded-t-2xl p-6 shadow-2xl" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
            <View className="items-center mb-6">
              <View className="w-12 h-1.5 bg-zinc-200 rounded-full mb-6" />
              <Text className="text-xl font-bold text-surface-900 mb-2">Contact Agent</Text>
              <Text className="text-zinc-500 font-medium text-center text-sm">How would you like to enquire about this property?</Text>
            </View>

            <View className="space-y-3">
              <Pressable 
                onPress={() => {
                  setShowContactOptions(false);
                  Linking.openURL(`whatsapp://send?phone=919901117057&text=${encodeURIComponent(`Hi Admin, I want to enquire about this property.\n\nProperty: ${property?.title}\nLocation: ${formatLocation(property?.location || '')}, ${property?.city}\nPrice: ${formatIndianCurrency(property?.price || 0)}\nProperty ID: ${property?.id?.substring(0, 6).toUpperCase()}\nMy User ID: ${currentUserCustomId || 'GUEST'}`)}`);
                }}
                className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex-row items-center"
              >
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                  <Phone size={20} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-emerald-900 font-bold text-base mb-0.5">WhatsApp</Text>
                  <Text className="text-emerald-700 text-xs">Instant message via WhatsApp</Text>
                </View>
              </Pressable>

              <Pressable 
                onPress={() => {
                  setShowContactOptions(false);
                  router.push(`/chat/buyer/${existingEnquiryId || "new"}?propertyId=${property?.id}` as any);
                }}
                className="w-full bg-blue-50 border border-blue-100 p-4 rounded-xl flex-row items-center"
              >
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <MessageSquare size={20} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="text-blue-900 font-bold text-base mb-0.5">In-App Chat</Text>
                  <Text className="text-blue-700 text-xs">Chat securely within the app</Text>
                </View>
              </Pressable>

              <Pressable 
                onPress={() => {
                  setShowContactOptions(false);
                  setTimeout(() => setShowEnquiryModal(true), 300);
                }}
                className="w-full bg-brand-500/10 border border-brand-500/20 p-4 rounded-xl flex-row items-center"
              >
                <View className="w-10 h-10 bg-brand-500/20 rounded-full items-center justify-center mr-3">
                  <Info size={20} className="text-brand-500" />
                </View>
                <View className="flex-1">
                  <Text className="text-brand-500 font-bold text-base mb-0.5">Submit Enquiry</Text>
                  <Text className="text-brand-500/70 text-xs">Send a detailed form request</Text>
                </View>
              </Pressable>

              <Pressable 
                onPress={() => setShowContactOptions(false)}
                className="w-full bg-zinc-100 p-4 rounded-xl items-center mt-2"
              >
                <Text className="text-surface-900 font-bold text-base">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Enquiry Form Modal */}
      <Modal
        visible={showEnquiryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEnquiryModal(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} className="flex-1 justify-end bg-black/60">
          <View className="bg-surface-100 rounded-t-2xl p-6 max-h-[85%] shadow-2xl" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
            <View className="flex-row justify-between items-center mb-6 pt-2">
              <Text className="text-xl font-bold text-surface-900">Enquire Now</Text>
              <Pressable onPress={() => setShowEnquiryModal(false)} className="bg-zinc-100 p-2 rounded-full">
                <X size={20} color="#52525B" />
              </Pressable>
            </View>
            <ScrollView className="w-full" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text className="text-zinc-500 mb-6 font-medium text-sm">
                Fill in your details and we'll connect you directly with the property owner or agent.
              </Text>
              
              <View className="space-y-4">
                <View>
                  <Text className="text-xs font-bold text-surface-900 mb-2 ml-1">Full Name</Text>
                  <TextInput
                    value={enquiryForm.name}
                    onChangeText={(t) => setEnquiryForm({...enquiryForm, name: t})}
                    placeholder="Enter your name"
                    className="bg-white border border-surface-200 px-4 py-3 rounded-xl text-surface-900 font-medium text-base"
                  />
                </View>
                
                <View>
                  <Text className="text-xs font-bold text-surface-900 mb-2 ml-1">Email Address</Text>
                  <TextInput
                    value={enquiryForm.email}
                    onChangeText={(t) => setEnquiryForm({...enquiryForm, email: t})}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="bg-white border border-surface-200 px-4 py-3 rounded-xl text-surface-900 font-medium text-base"
                  />
                </View>
                
                <View>
                  <Text className="text-xs font-bold text-surface-900 mb-2 ml-1">Phone Number</Text>
                  <TextInput
                    value={enquiryForm.phone}
                    onChangeText={(t) => setEnquiryForm({...enquiryForm, phone: t})}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    className="bg-white border border-surface-200 px-4 py-3 rounded-xl text-surface-900 font-medium text-base"
                  />
                </View>
                
                <View>
                  <Text className="text-xs font-bold text-surface-900 mb-2 ml-1">Message (Optional)</Text>
                  <TextInput
                    value={enquiryForm.message}
                    onChangeText={(t) => setEnquiryForm({...enquiryForm, message: t})}
                    placeholder="I am interested in this property..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="bg-white border border-surface-200 px-4 py-3 rounded-xl text-surface-900 font-medium text-base h-24"
                  />
                </View>
              </View>

              <View className="mt-6">
                <Pressable 
                  onPress={async () => {
                    try {
                      setIsSubmittingEnquiry(true);
                      const { error } = await supabase.from('enquiries').insert({
                        property_id: property.id,
                        user_id: currentUserId,
                        name: enquiryForm.name,
                        email: enquiryForm.email,
                        phone: enquiryForm.phone,
                        message: enquiryForm.message,
                        status: 'PENDING'
                      });
                      
                      if (error) throw error;
                      
                      Alert.alert("Success", "Your enquiry has been sent. The agent will contact you shortly.");
                      setShowEnquiryModal(false);
                    } catch (e: any) {
                      Alert.alert("Error", e.message || "Failed to send enquiry");
                    } finally {
                      setIsSubmittingEnquiry(false);
                    }
                  }}
                  disabled={!enquiryForm.name || !enquiryForm.email || !enquiryForm.phone || isSubmittingEnquiry}
                  className={`w-full py-3 rounded-xl items-center flex-row justify-center ${(!enquiryForm.name || !enquiryForm.email || !enquiryForm.phone || isSubmittingEnquiry) ? 'bg-zinc-200' : 'bg-brand-500 shadow-sm'}`}
                >
                  {isSubmittingEnquiry ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className={`font-bold text-base ${(!enquiryForm.name || !enquiryForm.email || !enquiryForm.phone || isSubmittingEnquiry) ? 'text-zinc-400' : 'text-white'}`}>Send Enquiry</Text>
                  )}
                </Pressable>
              </View>
              <View className="h-16" />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}