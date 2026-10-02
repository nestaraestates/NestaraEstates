import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Keyboard, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Eye, EyeOff } from 'lucide-react-native';

export default function OnboardingScreen() {
 const [fullName, setFullName] = useState('');
 const [phoneNumber, setPhoneNumber] = useState('');
 const [address, setAddress] = useState('');
 const [whatsappEnabled, setWhatsappEnabled] = useState(false);
 const [primaryIntent, setPrimaryIntent] = useState('BUY');
 const [preferredCities, setPreferredCities] = useState('');
 const [companyName, setCompanyName] = useState('');
 const [bio, setBio] = useState('');
 const [avatarUri, setAvatarUri] = useState<string | null>(null);
 
 const [needsPassword, setNeedsPassword] = useState(false);
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 
 const [loading, setLoading] = useState(false);
 const router = useRouter();

 useEffect(() => {
 async function checkAuthProviders() {
 const { data: { session } } = await supabase.auth.getSession();
 if (session?.user) {
 const providers = session.user.app_metadata?.providers || [];
 // If they logged in with Google but not email, prompt to create password
 if (providers.includes('google') && !providers.includes('email')) {
 setNeedsPassword(true);
 }
 }
 }
 checkAuthProviders();
 }, []);

 async function pickImage() {
 let result = await ImagePicker.launchImageLibraryAsync({
 mediaTypes: ImagePicker.MediaTypeOptions.Images,
 allowsEditing: true,
 aspect: [1, 1],
 quality: 0.5,
 });

 if (!result.canceled) {
 setAvatarUri(result.assets[0].uri);
 }
 }

 async function saveProfile() {
 if (!fullName || !phoneNumber || !address) {
 Alert.alert('Missing Info', 'Please fill in required fields (Name, Phone, City) or skip for now.');
 return;
 }

 if (phoneNumber.length !== 10) {
 Alert.alert('Invalid Phone', 'Please enter a valid 10-digit Indian mobile number.');
 return;
 }
 
 if (needsPassword) {
 if (!password || password.length < 6) {
 Alert.alert('Invalid Password', 'Please enter a password of at least 6 characters.');
 return;
 }
 if (password !== confirmPassword) {
 Alert.alert('Password Mismatch', 'Your passwords do not match!');
 return;
 }
 }
 
 setLoading(true);
 const { data: { session } } = await supabase.auth.getSession();
 
 if (session?.user) {
 // 1. Update the password if needed
 if (needsPassword && password) {
 const { error: passwordError } = await supabase.auth.updateUser({ password: password });
 if (passwordError) {
 Alert.alert('Error saving password', passwordError.message);
 setLoading(false);
 return;
 }
 }

 // 2. Continue with profile update
 const citiesArray = preferredCities ? preferredCities.split(',').map(c => c.trim()) : [];
 
 let finalAvatarUrl = null;
 if (avatarUri) {
 try {
 const base64 = await FileSystem.readAsStringAsync(avatarUri, { encoding: 'base64' });
 const filePath = `${session.user.id}-${Math.random()}.jpg`;
 const contentType = 'image/jpeg';
 
 const { error: uploadError } = await supabase.storage
 .from('avatars')
 .upload(filePath, decode(base64), { contentType });
 
 if (!uploadError) {
 const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
 finalAvatarUrl = data.publicUrl;
 }
 } catch (e) {
 console.error("Avatar upload failed", e);
 }
 }

 const updatePayload: any = { 
 full_name: fullName, 
 phone_number: `+91 ${phoneNumber}`,
 address: address,
 whatsapp_enabled: whatsappEnabled,
 primary_intent: primaryIntent,
 preferred_cities: citiesArray,
 company_name: companyName,
 bio: bio
 };

 if (finalAvatarUrl) updatePayload.avatar_url = finalAvatarUrl;

 const { error } = await supabase
 .from('profiles')
 .update(updatePayload)
 .eq('id', session.user.id);
 
 if (error) {
 Alert.alert('Error', error.message);
 } else {
 router.replace('/(tabs)');
 }
 }
 setLoading(false);
 }

 async function skipOnboarding() {
 try {
 await AsyncStorage.setItem('onboarding_skip_timestamp', Date.now().toString());
 } catch (e) {
 console.error('Failed to save skip timestamp', e);
 }
 router.replace('/(tabs)');
 }

 return (
 <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <View className="absolute w-full h-full">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070&auto=format&fit=crop' }} 
          className="w-full h-full opacity-60" 
          resizeMode="cover" 
        />
        <View className="absolute w-full h-full bg-black/60" />
      </View>
      <SafeAreaView className="flex-1">
 <KeyboardAvoidingView 
 behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
 className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
 >
 <ScrollView 
 className="flex-1"
 contentContainerStyle={{ padding: 16, paddingVertical: 24 }}
 showsVerticalScrollIndicator={false}
 keyboardShouldPersistTaps="handled"
 keyboardDismissMode="on-drag"
 >
 <View className="items-center mb-8 mt-4 space-y-2">
 <Text className="text-3xl font-black text-white">Complete Profile</Text>
 <Text className="text-sm text-zinc-300 text-center font-medium px-4">
 Tell us a bit more about yourself to personalize your experience on Nestara.
 </Text>
 </View>

 <View className="space-y-6">
 
 {/* Section 1: Basic Info */}
 <View className="bg-white/10 border border-white/20 rounded-3xl p-5 backdrop-blur-xl space-y-4 shadow-sm">
 <Text className="text-lg font-bold text-white mb-2">Basic Details</Text>
 
 <View className="items-center mb-2">
 <Pressable onPress={pickImage} className="w-24 h-24 rounded-full bg-zinc-100 border-2 border-dashed border-zinc-300 items-center justify-center overflow-hidden">
 {avatarUri ? (
 <Image source={{ uri: avatarUri }} className="w-full h-full" />
 ) : (
 <View className="items-center justify-center">
 <Text className="text-zinc-400 text-2xl">+</Text>
 <Text className="text-zinc-500 text-xs mt-1">Photo</Text>
 </View>
 )}
 </Pressable>
 </View>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-white">Full Name *</Text>
 <TextInput
 value={fullName}
 onChangeText={setFullName}
 placeholder="John Doe"
 placeholderTextColor="#A1A1AA"
 className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2.5 text-white"
 />
 </View>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-white">Phone Number *</Text>
 <View className="flex-row items-center w-full bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
 <View className="px-3 py-2.5 bg-black/40 border-r border-white/10">
 <Text className="text-zinc-300 font-medium">+91</Text>
 </View>
 <TextInput
 value={phoneNumber}
 onChangeText={setPhoneNumber}
 placeholder="9876543210"
 placeholderTextColor="#A1A1AA"
 keyboardType="number-pad"
 maxLength={10}
 className="flex-1 px-3 py-2.5 text-white bg-black/30"
 />
 </View>
 </View>

 <Pressable onPress={() => setWhatsappEnabled(!whatsappEnabled)} className="flex-row items-center space-x-3 pt-1">
 <View className={`w-5 h-5 rounded border items-center justify-center ${whatsappEnabled ? 'bg-amber-500 border-amber-500' : 'border-zinc-300'}`}>
 {whatsappEnabled && <Text className="text-white text-xs font-bold">✓</Text>}
 </View>
 <Text className="text-sm text-zinc-200">This number is on WhatsApp</Text>
 </Pressable>
 </View>

 {/* Section 2: Location & Preferences */}
 <View className="bg-white/10 border border-white/20 rounded-3xl p-5 backdrop-blur-xl space-y-4 shadow-sm">
 <Text className="text-lg font-bold text-white mb-2">Location & Intent</Text>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-white">City / Address *</Text>
 <TextInput
 value={address}
 onChangeText={setAddress}
 placeholder="Bengaluru, Karnataka"
 placeholderTextColor="#A1A1AA"
 className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2.5 text-white"
 />
 </View>

 <View className="space-y-2 mt-2">
 <Text className="text-sm font-medium text-white">Primary Intent</Text>
 <View className="flex-row space-x-2">
 {['BUY', 'RENT', 'SELL'].map(intent => (
 <Pressable 
 key={intent}
 onPress={() => setPrimaryIntent(intent)}
 className={`flex-1 p-2 rounded-md border items-center justify-center ${primaryIntent === intent ? 'bg-amber-500 border-amber-500' : 'bg-black/30 border-white/10'}`}
 >
 <Text className={`text-xs font-medium ${primaryIntent === intent ? 'text-white' : 'text-zinc-300'}`}>
 {intent === 'BUY' ? 'Buy' : intent === 'RENT' ? 'Rent' : 'Sell'}
 </Text>
 </Pressable>
 ))}
 </View>
 </View>

 <View className="space-y-1 mt-2">
 <Text className="text-sm font-medium text-white">Preferred Cities (Karnataka)</Text>
 <TextInput
 value={preferredCities}
 onChangeText={setPreferredCities}
 placeholder="e.g. Bengaluru, Mysuru"
 placeholderTextColor="#A1A1AA"
 className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2.5 text-white"
 />
 </View>
 </View>

 {/* Section 3: Professional Info */}
 <View className="bg-white/10 border border-white/20 rounded-3xl p-5 backdrop-blur-xl space-y-4 shadow-sm">
 <Text className="text-lg font-bold text-white mb-2">Optional Info</Text>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-white">Company Name (Optional)</Text>
 <TextInput
 value={companyName}
 onChangeText={setCompanyName}
 placeholder="e.g. Nestara Realty"
 placeholderTextColor="#A1A1AA"
 className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2.5 text-white"
 />
 </View>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-white">Bio (Optional)</Text>
 <TextInput
 value={bio}
 onChangeText={setBio}
 placeholder="Tell us what you are looking for..."
 placeholderTextColor="#A1A1AA"
 multiline
 numberOfLines={3}
 className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-3 text-white min-h-[80px] text-top"
 />
 </View>
 </View>

 {/* Section 4: Password Setup (For Google Logins) */}
 {needsPassword && (
 <View className="bg-white/10 border border-white/20 rounded-[32px] p-6 space-y-4 shadow-sm backdrop-blur-xl mt-4">
 <Text className="text-xl font-bold text-white mb-1">Create Password</Text>
 <Text className="text-xs text-zinc-300 mb-2 ml-1">Since you signed in with Google, please create a password for email login.</Text>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-white mb-1 ml-1">Password</Text>
 <View className="relative">
 <TextInput
 value={password}
 onChangeText={setPassword}
 placeholder="••••••••"
 placeholderTextColor="#A1A1AA"
 secureTextEntry={!showPassword}
 className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white"
 />
 <Pressable 
 onPress={() => setShowPassword(!showPassword)}
 className="absolute right-4 h-full justify-center"
 >
 {/* @ts-ignore */}
 {showPassword ? <EyeOff size={20} color="#A1A1AA" /> : <Eye size={20} color="#A1A1AA" />}
 </Pressable>
 </View>
 </View>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-white mb-1 ml-1">Confirm Password</Text>
 <View className="relative">
 <TextInput
 value={confirmPassword}
 onChangeText={setConfirmPassword}
 placeholder="••••••••"
 placeholderTextColor="#A1A1AA"
 secureTextEntry={!showConfirmPassword}
 className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white"
 />
 <Pressable 
 onPress={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-4 h-full justify-center"
 >
 {/* @ts-ignore */}
 {showConfirmPassword ? <EyeOff size={20} color="#A1A1AA" /> : <Eye size={20} color="#A1A1AA" />}
 </Pressable>
 </View>
 </View>
 </View>
 )}

 {/* Actions */}
 <View className="mt-4 mb-10 space-y-3">
 <Pressable
 onPress={saveProfile}
 disabled={loading}
 className={`w-full bg-amber-500 rounded-2xl py-3.5 items-center justify-center shadow-sm ${loading ? 'opacity-70' : ''}`}
 >
 {loading ? (
 <ActivityIndicator color="white" />
 ) : (
 <Text className="text-white font-bold text-base">Save & Continue</Text>
 )}
 </Pressable>

 <Pressable
 onPress={skipOnboarding}
 className="w-full py-3.5 items-center justify-center border border-white/20 rounded-2xl bg-white/10 backdrop-blur-xl"
 >
 <Text className="text-zinc-300 font-medium">Skip for now</Text>
 </Pressable>
 </View>

 </View>
 </ScrollView>
 </KeyboardAvoidingView>
 </SafeAreaView>
    </View>
 );
}
