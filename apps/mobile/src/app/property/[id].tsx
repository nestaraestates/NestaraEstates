import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, Pressable, Linking, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { WebView } from 'react-native-webview';
import { MapPin, Bed, Bath, Square, ChevronLeft, Calendar, Info, Phone, MessageSquare, ShieldCheck, Heart } from 'lucide-react-native';
import { FinancialTools } from '@/components/FinancialTools';

export default function PropertyDetailsScreen() {
 const { id } = useLocalSearchParams();
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
 const [currentUserId, setCurrentUserId] = useState<string | null>(null);
 const [currentUserCustomId, setCurrentUserCustomId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
 const [isFavorited, setIsFavorited] = useState(false);
 const [showEnquiryModal, setShowEnquiryModal] = useState(false);
 const [existingEnquiryId, setExistingEnquiryId] = useState<string | null>(null);
 const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', address: '', message: '' });
 const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

 useEffect(() => {
 const fetchProperty = async () => {
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
 
 setLoading(false);
 };

 fetchProperty();
 }, [id]);

 
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

 <View className="flex-1 justify-center items-center bg-zinc-50 ">
 <ActivityIndicator size="large" color="#f59e0b" />
 </View>
 );
 }

 if (!property) {
 return (
 <View className="flex-1 justify-center items-center bg-zinc-50 ">
 <Text className="text-zinc-500">Property not found.</Text>
 </View>
 );
 }

 const images = property.property_media?.filter((m: any) => m.media_type === 'IMAGE').map((m: any) => m.url) || [];
  if (images.length === 0) images.push('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop');

 return (
 <View className="flex-1 bg-white ">
 <Stack.Screen options={{ headerShown: false }} />
 
 <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false} bounces={true}>
  
        <SafeAreaView edges={['top']} className="bg-white">
          <View className="flex-row items-center justify-between px-4 py-2 border-b border-zinc-100">
            <Pressable onPress={() => { if(router.canGoBack()) router.back(); else router.push('/'); }} className="p-2 -ml-2">
              {/* @ts-ignore */}
              <ChevronLeft size={24} color="#18181b" />
            </Pressable>
            <Image source={require('../../../assets/images/logo-sm.png')} className="w-8 h-8 opacity-80" resizeMode="contain" />
            <View className="w-8" />
          </View>
        
      {/* Enquiry Modal */}
      <Modal visible={showEnquiryModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEnquiryModal(false)}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="p-4 border-b border-zinc-200 flex-row justify-between items-center bg-zinc-50">
            <Text className="text-xl font-bold text-zinc-900">Contact Nestara Agent</Text>
            <Pressable onPress={() => setShowEnquiryModal(false)} className="p-2">
              <Text className="text-zinc-500 font-bold">Close</Text>
            </Pressable>
          </View>
          
          <ScrollView className="flex-1 p-6" keyboardShouldPersistTaps="handled">
            <Text className="text-sm text-zinc-600 mb-6">
              Please confirm your details. This will save to your profile for future use.
            </Text>
            
            <View className="space-y-4 mb-8">
              <View>
                <Text className="text-xs font-bold text-zinc-500 uppercase mb-1">Full Name</Text>
                <TextInput className="bg-white border border-zinc-200 rounded-lg px-4 py-3 text-base text-zinc-900" value={enquiryForm.name} onChangeText={t => setEnquiryForm({...enquiryForm, name: t})} placeholder="Your Name" />
              </View>
              
              <View>
                <Text className="text-xs font-bold text-zinc-500 uppercase mb-1">Email</Text>
                <TextInput className="bg-white border border-zinc-200 rounded-lg px-4 py-3 text-base text-zinc-900" value={enquiryForm.email} onChangeText={t => setEnquiryForm({...enquiryForm, email: t})} placeholder="Your Email" keyboardType="email-address" autoCapitalize="none" />
              </View>
              
              <View>
                <Text className="text-xs font-bold text-zinc-500 uppercase mb-1">Phone Number</Text>
                <TextInput className="bg-white border border-zinc-200 rounded-lg px-4 py-3 text-base text-zinc-900" value={enquiryForm.phone} onChangeText={t => setEnquiryForm({...enquiryForm, phone: t})} placeholder="Your Phone Number" keyboardType="phone-pad" />
              </View>
              
              <View>
                <Text className="text-xs font-bold text-zinc-500 uppercase mb-1">Address</Text>
                <TextInput className="bg-white border border-zinc-200 rounded-lg px-4 py-3 text-base text-zinc-900" value={enquiryForm.address} onChangeText={t => setEnquiryForm({...enquiryForm, address: t})} placeholder="Your Residential Address" />
              </View>
              
              <View>
                <Text className="text-xs font-bold text-zinc-500 uppercase mb-1">Message</Text>
                <TextInput className="bg-white border border-zinc-200 rounded-lg px-4 py-3 text-base text-zinc-900 min-h-[100px]" value={enquiryForm.message} onChangeText={t => setEnquiryForm({...enquiryForm, message: t})} placeholder="I am interested in viewing this property..." multiline textAlignVertical="top" />
              </View>
            </View>
            
            <View className="flex-row gap-4 mb-10">
              <Pressable onPress={() => setShowEnquiryModal(false)} className="flex-1 py-4 bg-white border border-zinc-200 rounded-xl items-center">
                <Text className="text-zinc-600 font-bold text-base">Cancel</Text>
              </Pressable>
              <Pressable onPress={submitEnquiry} disabled={isSubmittingEnquiry} className={`flex-1 py-4 rounded-xl items-center ${isSubmittingEnquiry ? 'bg-amber-300' : 'bg-amber-500'}`}>
                {isSubmittingEnquiry ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Submit</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

 </SafeAreaView>

        {/* Top Info (Web Style) */}
        <View className="px-4 pt-5 pb-4 bg-white">
          <View className="flex-row space-x-2 mb-3">
            <View className="bg-zinc-100 px-3 py-1 rounded-sm border border-zinc-200">
              <Text className="text-zinc-600 font-bold text-xs uppercase tracking-wider">FOR {property.purpose}</Text>
            </View>
            <View className="bg-zinc-100 px-3 py-1 rounded-sm border border-zinc-200">
              <Text className="text-zinc-600 font-bold text-xs uppercase tracking-wider">{property?.type?.replace('_', ' ') || 'PROPERTY'}</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-4xl font-black text-amber-600">₹ {property.price.toLocaleString('en-IN')}</Text>
            {property.is_verified ? (
              <View className="flex-row items-center border border-emerald-500 px-3 py-1 rounded-full">
                {/* @ts-ignore */}
                <ShieldCheck size={14} color="#10b981" />
                <Text className="text-xs font-bold text-emerald-600 ml-1.5 uppercase">Verified</Text>
              </View>
            ) : (
              <View className="flex-row items-center border border-zinc-300 px-3 py-1 rounded-full bg-zinc-50">
                {/* @ts-ignore */}
                <ShieldCheck size={14} color="#71717a" />
                <Text className="text-xs font-bold text-zinc-500 ml-1.5 uppercase">Unverified</Text>
              </View>
            )}
          </View>

          <Text className="text-3xl font-bold text-zinc-900 mb-2">{property.title}</Text>
          
          <View className="flex-row items-center mb-6">
            {/* @ts-ignore */}
            <MapPin size={18} color="#71717A" />
            <Text className="text-base font-medium text-zinc-500 ml-1">{property.location}, {property.city}</Text>
          </View>

          <View className="flex-row space-x-3">
            <Pressable className="flex-row items-center border border-zinc-200 px-4 py-2 rounded-full" onPress={async () => {
              try {
                const siteUrl = process.env.EXPO_PUBLIC_SITE_URL || 'https://your-future-domain.com';
                await require('react-native').Share.share({
                  message: `Check out this property on Nestara Estates: ${property.title} for ₹${property.price.toLocaleString('en-IN')}\n\n${siteUrl}/property/${property.id}`,
                });
              } catch (error: any) {
                Alert.alert('Error', error.message);
              }
            }}>
              <Text className="text-zinc-700 font-bold ml-1">Share</Text>
            </Pressable>
            <Pressable className="flex-row items-center border border-zinc-200 px-4 py-2 rounded-full" onPress={toggleFavorite}>
              {/* @ts-ignore */}
              <Heart size={18} color={isFavorited ? "#ef4444" : "#52525b"} fill={isFavorited ? "#ef4444" : "transparent"} />
              <Text className="text-zinc-700 font-bold ml-2">{isFavorited ? "Saved" : "Save"}</Text>
            </Pressable>
          </View>
        </View>

        {/* Image Carousel (Moved Below Title) */}
        <View className="relative w-full h-72 bg-zinc-200 mb-6">
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} className="w-full h-full">
            {images.map((url: string, index: number) => (
              <Pressable key={index} onPress={() => setFullScreenIndex(index)} style={{ width: require('react-native').Dimensions.get('window').width, height: '100%' }}>
                <Image source={{ uri: url }} className="w-screen h-full" resizeMode="cover" />
              </Pressable>
            ))}
          </ScrollView>
          {images.length > 1 && (
            <View pointerEvents="none" className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
              <Text className="text-white text-xs font-bold">Swipe for more</Text>
            </View>
          )}
        </View>

        <View className="px-4 space-y-6 pb-20">
          
          {/* Key Features Grid */}
          <View className="flex-row flex-wrap justify-between bg-white border border-zinc-200 rounded-xl overflow-hidden p-2">
            <View className="w-[48%] items-start p-3 bg-zinc-50 rounded-lg mb-2">
              <Text className="text-xs text-zinc-500 font-semibold uppercase mb-1">Bedrooms</Text>
              <Text className="text-base font-bold text-zinc-900">{property.bhk} BHK</Text>
            </View>
            <View className="w-[48%] items-start p-3 bg-zinc-50 rounded-lg mb-2">
              <Text className="text-xs text-zinc-500 font-semibold uppercase mb-1">Bathrooms</Text>
              <Text className="text-base font-bold text-zinc-900">{property.bathrooms}</Text>
            </View>
            <View className="w-full items-start p-3 bg-zinc-50 rounded-lg">
              <Text className="text-xs text-zinc-500 font-semibold uppercase mb-1">Super Area</Text>
              <Text className="text-base font-bold text-zinc-900">{property.area_sqft} sq.ft</Text>
            </View>
          </View>

          {/* Description */}
          <View>
            <Text className="text-xl font-bold text-zinc-900 mb-2">Description</Text>
            <Text className="text-zinc-600 leading-6">{property.description || "No description provided."}</Text>
          </View>

          {/* Verification Status Box */}
          <View className={`p-5 rounded-xl border ${property.is_verified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <View className="flex-row items-center mb-4">
              {/* @ts-ignore */}
              <ShieldCheck size={24} color={property.is_verified ? "#10b981" : "#f59e0b"} />
              <Text className={`font-black text-lg ml-2 ${property.is_verified ? 'text-emerald-700' : 'text-amber-800'}`}>
                Verification: {property.is_verified ? 'Verified' : 'Pending'}
              </Text>
            </View>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Text className={property.is_verified ? "text-emerald-600 mr-2" : "text-amber-600 mr-2"}>✓</Text>
                <Text className="text-zinc-700 font-medium">Encumbrances Check: {property.is_verified ? 'Verified' : 'Pending'}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className={property.is_verified ? "text-emerald-600 mr-2" : "text-amber-600 mr-2"}>✓</Text>
                <Text className="text-zinc-700 font-medium">Tax Receipts: {property.is_verified ? 'Verified' : 'Pending'}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className={property.is_verified ? "text-emerald-600 mr-2" : "text-amber-600 mr-2"}>✓</Text>
                <Text className="text-zinc-700 font-medium">Title Document: {property.is_verified ? 'Verified' : 'Pending'}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className={property.is_verified ? "text-emerald-600 mr-2" : "text-amber-600 mr-2"}>✓</Text>
                <Text className="text-zinc-700 font-medium">Identity Verification: {property.is_verified ? 'Verified' : 'Pending'}</Text>
              </View>
            </View>
          </View>

          {/* Financial Tools */}
          <View>
            <Text className="text-xl font-bold text-zinc-900 mb-[-10px]">Financial Tools</Text>
            <FinancialTools propertyPrice={property.price} purpose={property.purpose} />
          </View>

          {/* Location Map Placeholder */}
          <View>
            <Text className="text-xl font-bold text-zinc-900 mb-3">Location Map</Text>
            <View className="w-full h-56 bg-zinc-100 rounded-2xl overflow-hidden items-center justify-center border border-zinc-200 shadow-sm">
              <View className="bg-white p-5 rounded-2xl items-center shadow-md w-4/5 border border-amber-100">
                <View className="w-12 h-12 bg-amber-50 rounded-full items-center justify-center mb-3">
                  {/* @ts-ignore */}
                  <MapPin size={24} color="#d97706" />
                </View>
                <Text className="font-bold text-zinc-900 text-lg mb-2">Location Protected</Text>
                <Text className="text-sm text-center text-zinc-500 mb-4">To protect the seller's privacy, the exact map pin is hidden.</Text>
                <Pressable className="border border-amber-600 rounded-full px-5 py-2">
                  <Text className="text-amber-700 font-bold">Contact Agent for Details</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Contact Seller or Owner Actions */}
          {currentUserId === property.owner_id ? (
            <View className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm mt-4 items-center">
              <Text className="text-xl font-black text-zinc-900 mb-1">Your Listing</Text>
              <Text className="text-sm text-center text-zinc-500 mb-5">You are the owner of this property.</Text>
              
              <View className="w-full space-y-3">
                <Pressable onPress={() => router.push(`/edit-property/${id}` as any)} className="w-full bg-amber-500 py-4 rounded-xl items-center shadow-sm">
                  <Text className="text-white font-bold text-base">Edit Listing</Text>
                </Pressable>
                <Pressable onPress={handleDelete} className="w-full bg-white border-2 border-red-100 py-4 rounded-xl items-center shadow-sm">
                  <Text className="text-red-600 font-bold text-base">Delete Listing</Text>
                </Pressable>
                <Pressable onPress={() => Linking.openURL(`whatsapp://send?phone=919901117057&text=${encodeURIComponent(`Hi Admin, I need help with my listing.\n\nProperty: ${property.title}\nProperty ID: ${property.id.substring(0, 6).toUpperCase()}\nMy User ID: ${currentUserCustomId || "GUEST"}`)}`)} className="w-full bg-emerald-600 py-4 rounded-xl items-center shadow-sm flex-row justify-center">
                  {/* @ts-ignore */}
                  <MessageSquare size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">Chat with Admin</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="mt-4 space-y-3">
              {existingEnquiryId ? (
                <Pressable 
                  onPress={() => router.push(`/chat/buyer/${existingEnquiryId}` as any)}
                  className="w-full border-2 border-emerald-200 bg-emerald-50 py-4 rounded-xl items-center flex-row justify-center shadow-sm"
                >
                  <Text className="text-emerald-800 font-bold text-base text-center" numberOfLines={1}>Continue Enquiry Chat</Text>
                </Pressable>
              ) : (
                <Pressable 
                  onPress={() => { if (!currentUserId) { Alert.alert('Login Required', 'Please log in to enquire.'); return; } setShowEnquiryModal(true); }}
                  className="w-full border-2 border-zinc-200 bg-white py-4 rounded-xl items-center flex-row justify-center shadow-sm"
                >
                  <Text className="text-zinc-800 font-bold text-base text-center" numberOfLines={1}>Submit Enquiry</Text>
                </Pressable>
              )}
              
              <Pressable 
                onPress={() => {
                  Alert.alert(
                    'Contact Admin',
                    'How would you like to enquire about this property?',
                    [
                      { text: 'WhatsApp', onPress: () => Linking.openURL(`whatsapp://send?phone=919901117057&text=${encodeURIComponent(`Hi Admin, I want to enquire about this property.\n\nProperty: ${property.title}\nLocation: ${property.location}, ${property.city}\nPrice: ₹${property.price.toLocaleString('en-IN')}\nProperty ID: ${property.id.substring(0, 6).toUpperCase()}\nMy User ID: ${currentUserCustomId || 'GUEST'}`)}`) },
                      { text: 'In-App Chat', onPress: () => router.push(`/chat/buyer/${existingEnquiryId || "new"}?propertyId=${property.id}` as any) },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}
                className="w-full bg-emerald-600 py-4 rounded-xl items-center flex-row justify-center shadow-sm"
              >
                {/* @ts-ignore */}
                <MessageSquare size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">Chat with Admin</Text>
              </Pressable>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Fullscreen Image Viewer Modal */}
      <Modal visible={fullScreenIndex !== null} presentationStyle="pageSheet" animationType="slide" onRequestClose={() => setFullScreenIndex(null)}>
        <View className="flex-1 bg-black">
          <SafeAreaView pointerEvents="box-none" className="absolute top-0 w-full z-50 flex-row justify-end px-4 pt-4">
            <Pressable 
              onPress={() => setFullScreenIndex(null)}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md"
            >
              <Text className="text-white font-bold text-lg">X</Text>
            </Pressable>
          </SafeAreaView>
          
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false} 
            className="flex-1"
            contentOffset={{ x: fullScreenIndex !== null ? fullScreenIndex * require('react-native').Dimensions.get('window').width : 0, y: 0 }}
          >
            {images.map((url: string, index: number) => (
              <View key={index} style={{ width: require('react-native').Dimensions.get('window').width, height: '100%', justifyContent: 'center' }}>
                <Image 
                  source={{ uri: url }} 
                  style={{ width: '100%', height: '80%' }}
                  resizeMode="contain" 
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}