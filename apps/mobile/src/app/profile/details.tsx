import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Save, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function PersonalDetailsScreen() {
 const router = useRouter();
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [uploadingImage, setUploadingImage] = useState(false);
 const [userId, setUserId] = useState<string | null>(null);
 
 const [form, setForm] = useState({
 full_name: '',
 phone_number: '',
 address: '',
 whatsapp_enabled: false,
 primary_intent: '',
 preferred_cities: '',
 company_name: '',
 bio: '',
 email: '',
 role: '',
 created_at: '',
 avatar_url: '',
 custom_id: '',
 });

 useEffect(() => {
 const loadProfile = async () => {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) {
 setLoading(false);
 return;
 }
 setUserId(session.user.id);

 const { data, error } = await supabase
 .from('profiles')
 .select('full_name, phone_number, address, whatsapp_enabled, primary_intent, preferred_cities, company_name, bio, email, role, created_at, avatar_url, custom_id')
 .eq('id', session.user.id)
 .single();
 
 if (data) {
 setForm({
 full_name: data.full_name || '',
 phone_number: data.phone_number || '',
 address: data.address || '',
 whatsapp_enabled: data.whatsapp_enabled || false,
 primary_intent: data.primary_intent || 'BUY',
 preferred_cities: Array.isArray(data.preferred_cities) ? data.preferred_cities.join(', ') : (data.preferred_cities || ''),
 company_name: data.company_name || '',
 bio: data.bio || '',
 email: data.email || '',
 role: data.role || 'USER',
 created_at: data.created_at || '',
 avatar_url: data.avatar_url || '',
 custom_id: data.custom_id || '',
 });
 }
 setLoading(false);
 };

 loadProfile();
 }, []);

 
 const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setUploadingImage(true);
      const ext = result.assets[0].uri.split('.').pop() || 'jpeg';
      const filePath = `${userId}-${Date.now()}.${ext}`;
      
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${ext}`
        });
        
      if (!error) {
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        setForm({...form, avatar_url: publicUrlData.publicUrl});
      } else {
        Alert.alert('Upload Failed', error.message);
      }
      setUploadingImage(false);
    }
 };

 const handleSave = async () => {
 if (!userId) return;
 setSaving(true);
 
 const { error } = await supabase
 .from('profiles')
 .update({
 avatar_url: form.avatar_url,
 full_name: form.full_name,
 phone_number: form.phone_number,
 address: form.address,
 whatsapp_enabled: form.whatsapp_enabled,
 primary_intent: form.primary_intent,
 preferred_cities: form.preferred_cities.split(',').map(s => s.trim()).filter(Boolean),
 company_name: form.company_name,
 bio: form.bio,
 role: form.role,
 })
 .eq('id', userId);

 setSaving(false);

 if (error) {
 Alert.alert('Error', 'Failed to update profile.');
 } else {
 Alert.alert('Success', 'Profile updated successfully!', [
 { text: 'OK', onPress: () => router.push('/settings' as any) }
 ]);
 }
 };

 if (loading) {
 return (
 <View className="flex-1 justify-center items-center bg-zinc-50 ">
 <ActivityIndicator size="large" color="#f59e0b" />
 </View>
 );
 }

 return (
 <SafeAreaView className="flex-1 bg-zinc-50 ">
 <Stack.Screen options={{ headerShown: false }} />
 <KeyboardAvoidingView 
 behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
 className="flex-1"
 >
 <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
 <View className="flex-1">
 
 {/* Header */}
 <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-zinc-200 ">
 <Pressable onPress={() => router.push('/settings' as any)} className="p-2 -ml-2 rounded-full active:bg-zinc-100 :bg-zinc-800">
 {/* @ts-ignore */}
 <ChevronLeft size={24} color="#f59e0b" />
 </Pressable>
 <Text className="text-xl font-bold text-zinc-900 ">Personal Details</Text>
 <View className="w-10" />
 </View>

 <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
 
 <View className="items-center mb-8">
 <Pressable onPress={pickImage} className="relative items-center">
   <View className="w-28 h-28 rounded-full bg-amber-100 items-center justify-center border-4 border-white shadow-sm overflow-hidden">
     {form.avatar_url ? (
       <Image source={{ uri: form.avatar_url }} className="w-full h-full" />
     ) : (
       <Text className="text-amber-700 font-bold text-4xl">
         {form.full_name?.charAt(0) || 'U'}
       </Text>
     )}
     {uploadingImage && (
       <View className="absolute inset-0 bg-black/40 items-center justify-center">
         <ActivityIndicator color="white" />
       </View>
     )}
   </View>
   
   <View className="absolute bottom-0 right-0 bg-amber-500 w-9 h-9 rounded-full items-center justify-center border-2 border-white shadow-sm">
     {/* @ts-ignore */}
     <Camera size={16} color="white" />
   </View>
 </Pressable>
 <Text className="text-sm text-zinc-500 mt-4">Tap to upload profile photo</Text>
 </View>

 <View className="space-y-5">
 <View className="space-y-1.5">
 <Text className="text-sm font-semibold text-zinc-900 ">Full Name</Text>
 <TextInput
 value={form.full_name}
 onChangeText={(text) => setForm({ ...form, full_name: text })}
 placeholder="Enter your full name"
 placeholderTextColor="#A1A1AA"
 className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 shadow-sm"
 />
 </View>

 <View className="space-y-1.5">
 <Text className="text-sm font-semibold text-zinc-900 ">Phone Number</Text>
 <View className="flex-row items-center w-full bg-white border border-zinc-200 rounded-xl px-4 shadow-sm">
   <Text className="text-zinc-900 font-bold border-r border-zinc-200 pr-3 py-3.5 mr-3">+91</Text>
   <TextInput
     value={form.phone_number.replace('+91', '').trim()}
     onChangeText={(text) => {
       const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
       setForm({ ...form, phone_number: '+91 ' + cleaned });
     }}
     placeholder="Enter mobile number"
     placeholderTextColor="#A1A1AA"
     keyboardType="phone-pad"
     maxLength={10}
     className="flex-1 py-3.5 text-zinc-900 font-semibold"
   />
 </View>
</View>

 <View className="space-y-1.5 mt-2">
  <View className="flex-row items-center justify-between">
    <Text className="text-sm font-semibold text-zinc-900">Available on WhatsApp</Text>
    <Switch 
      value={form.whatsapp_enabled}
      onValueChange={(val) => setForm({...form, whatsapp_enabled: val})}
      trackColor={{ false: '#e4e4e7', true: '#f59e0b' }}
    />
  </View>
 </View>

 <View className="space-y-1.5">
 <Text className="text-sm font-semibold text-zinc-900 ">Address</Text>
 <TextInput
 value={form.address}
 onChangeText={(text) => setForm({ ...form, address: text })}
 placeholder="Enter your full address"
 placeholderTextColor="#A1A1AA"
 multiline
 numberOfLines={3}
 textAlignVertical="top"
 className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 shadow-sm min-h-[100px]"
 />
 </View>

 <View className="space-y-1.5">
 <Text className="text-sm font-semibold text-zinc-900 ">Company / Agency Name</Text>
 <TextInput
 value={form.company_name}
 onChangeText={(text) => setForm({ ...form, company_name: text })}
 placeholder="e.g. Nestara Realty"
 placeholderTextColor="#A1A1AA"
 className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 shadow-sm"
 />
 </View>

 <View className="space-y-1.5">
 <Text className="text-sm font-semibold text-zinc-900 ">Preferred Cities</Text>
 <TextInput
 value={form.preferred_cities}
 onChangeText={(text) => setForm({ ...form, preferred_cities: text })}
 placeholder="e.g. Bengaluru, Mysuru, Mangaluru"
 placeholderTextColor="#A1A1AA"
 className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 shadow-sm"
 />
 </View>

 <View className="space-y-1.5">
 <Text className="text-sm font-semibold text-zinc-900 ">Bio / Intentions</Text>
 <TextInput
 value={form.bio}
 onChangeText={(text) => setForm({ ...form, bio: text })}
 placeholder="Tell us what you are looking for..."
 placeholderTextColor="#A1A1AA"
 multiline
 numberOfLines={3}
 textAlignVertical="top"
 className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 shadow-sm min-h-[100px]"
 />
 </View>
 </View>

            {/* Account Type Toggle */}
            <View className="space-y-2 mt-4">
              <Text className="text-sm font-semibold text-zinc-900">Account Type</Text>
              {form.role === 'ADMIN' ? (
                <TextInput
                  value="Administrator"
                  editable={false}
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-500 shadow-sm"
                />
              ) : (
                <View className="flex-row space-x-3">
                  <Pressable 
                    onPress={() => setForm({...form, role: 'USER'})}
                    className={`flex-1 py-3 rounded-xl border ${form.role === 'USER' ? 'bg-amber-50 border-amber-500' : 'bg-white border-zinc-200'}`}
                  >
                    <Text className={`text-center font-bold ${form.role === 'USER' ? 'text-amber-700' : 'text-zinc-600'}`}>Buyer</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => setForm({...form, role: 'DEALER'})}
                    className={`flex-1 py-3 rounded-xl border ${form.role === 'DEALER' ? 'bg-amber-50 border-amber-500' : 'bg-white border-zinc-200'}`}
                  >
                    <Text className={`text-center font-bold ${form.role === 'DEALER' ? 'text-amber-700' : 'text-zinc-600'}`}>Seller / Agent</Text>
                  </Pressable>
                </View>
              )}
              <Text className="text-xs text-zinc-500 mt-1">You can switch your account type at any time.</Text>
            </View>

            {/* Read Only Account Info */}
            <View className="mt-6 border-t border-zinc-200 pt-6 space-y-4">
              <Text className="text-lg font-bold text-zinc-900 mb-2">Account Information</Text>
              
              <View className="space-y-1">
                <Text className="text-sm font-semibold text-zinc-500">User ID</Text>
                <TextInput
                  value={form.custom_id || ''}
                  editable={false}
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-800 shadow-sm font-mono text-base font-bold tracking-widest"
                />
                <Text className="text-xs text-zinc-400 mt-1 ml-1">Your unique system identifier.</Text>
              </View>

              <View className="space-y-1 mt-4">
                <Text className="text-sm font-semibold text-zinc-500">Email Address</Text>
                <TextInput
                  value={form.email}
                  editable={false}
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-500 shadow-sm"
                />
                <Text className="text-xs text-zinc-400 mt-1 ml-1">Email cannot be changed directly.</Text>
              </View>


              {form.created_at ? (
                <View className="space-y-1">
                  <Text className="text-sm font-semibold text-zinc-500">Member Since</Text>
                  <TextInput
                    value={new Date(form.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    editable={false}
                    className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-500 shadow-sm"
                  />
                </View>
              ) : null}
            </View>

 <Pressable
 onPress={handleSave}
 disabled={saving}
 className={`w-full bg-amber-500 rounded-xl py-4 flex-row items-center justify-center mt-10 shadow-sm ${saving ? 'opacity-70' : ''}`}
 >
 {saving ? (
 <ActivityIndicator color="white" />
 ) : (
 <>
 {/* @ts-ignore */}
 <Save size={20} color="white" className="mr-2" />
 <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>
 </>
 )}
 </Pressable>

 <View className="h-20" />
 </ScrollView>

 </View>
 </TouchableWithoutFeedback>
 </KeyboardAvoidingView>
 </SafeAreaView>
 );
}
