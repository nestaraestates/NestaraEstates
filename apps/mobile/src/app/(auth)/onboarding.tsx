import React, { useState, useEffect } from 'react';
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
 <SafeAreaView className="flex-1 bg-slate-50">
 <KeyboardAvoidingView 
 behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
 className="flex-1"
 >
 <ScrollView 
 className="flex-1"
 contentContainerStyle={{ padding: 16, paddingVertical: 24 }}
 showsVerticalScrollIndicator={false}
 >
 <View className="items-center mb-8 mt-4 space-y-2">
 <Text className="text-3xl font-bold tracking-tight text-slate-900">Complete Profile</Text>
 <Text className="text-sm text-slate-500 text-center px-4">
 Tell us a bit more about yourself to personalize your experience on Nestara.
 </Text>
 </View>

 <View className="space-y-6">
 
 {/* Section 1: Basic Info */}
 <View className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
 <Text className="text-lg font-bold text-slate-900 mb-2">Basic Details</Text>
 
 <View className="items-center mb-2">
 <Pressable onPress={pickImage} className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 items-center justify-center overflow-hidden">
 {avatarUri ? (
 <Image source={{ uri: avatarUri }} className="w-full h-full" />
 ) : (
 <View className="items-center justify-center">
 <Text className="text-slate-400 text-2xl">+</Text>
 <Text className="text-slate-500 text-xs mt-1">Photo</Text>
 </View>
 )}
 </Pressable>
 </View>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-slate-900">Full Name *</Text>
 <TextInput
 value={fullName}
 onChangeText={setFullName}
 placeholder="John Doe"
 placeholderTextColor="#A1A1AA"
 className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2.5 text-slate-900"
 />
 </View>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-slate-900">Phone Number *</Text>
 <View className="flex-row items-center w-full bg-slate-50 border border-slate-200 rounded-md overflow-hidden">
 <View className="px-3 py-2.5 bg-slate-100 border-r border-slate-200">
 <Text className="text-slate-600 font-medium">+91</Text>
 </View>
 <TextInput
 value={phoneNumber}
 onChangeText={setPhoneNumber}
 placeholder="9876543210"
 placeholderTextColor="#A1A1AA"
 keyboardType="number-pad"
 maxLength={10}
 className="flex-1 px-3 py-2.5 text-slate-900"
 />
 </View>
 </View>

 <Pressable onPress={() => setWhatsappEnabled(!whatsappEnabled)} className="flex-row items-center space-x-3 pt-1">
 <View className={`w-5 h-5 rounded border items-center justify-center ${whatsappEnabled ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
 {whatsappEnabled && <Text className="text-white text-xs font-bold">✓</Text>}
 </View>
 <Text className="text-sm text-slate-700">This number is on WhatsApp</Text>
 </Pressable>
 </View>

 {/* Section 2: Location & Preferences */}
 <View className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
 <Text className="text-lg font-bold text-slate-900 mb-2">Location & Intent</Text>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-slate-900">City / Address *</Text>
 <TextInput
 value={address}
 onChangeText={setAddress}
 placeholder="Bengaluru, Karnataka"
 placeholderTextColor="#A1A1AA"
 className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2.5 text-slate-900"
 />
 </View>

 <View className="space-y-2 mt-2">
 <Text className="text-sm font-medium text-slate-900">Primary Intent</Text>
 <View className="flex-row space-x-2">
 {['BUY', 'RENT', 'SELL'].map(intent => (
 <Pressable 
 key={intent}
 onPress={() => setPrimaryIntent(intent)}
 className={`flex-1 p-2 rounded-md border items-center justify-center ${primaryIntent === intent ? 'bg-blue-50 border-blue-600' : 'bg-slate-50 border-slate-200'}`}
 >
 <Text className={`text-xs font-medium ${primaryIntent === intent ? 'text-blue-700' : 'text-slate-600'}`}>
 {intent === 'BUY' ? 'Buy' : intent === 'RENT' ? 'Rent' : 'Sell'}
 </Text>
 </Pressable>
 ))}
 </View>
 </View>

 <View className="space-y-1 mt-2">
 <Text className="text-sm font-medium text-slate-900">Preferred Cities (Karnataka)</Text>
 <TextInput
 value={preferredCities}
 onChangeText={setPreferredCities}
 placeholder="e.g. Bengaluru, Mysuru"
 placeholderTextColor="#A1A1AA"
 className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2.5 text-slate-900"
 />
 </View>
 </View>

 {/* Section 3: Professional Info */}
 <View className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
 <Text className="text-lg font-bold text-slate-900 mb-2">Optional Info</Text>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-slate-900">Company Name (Optional)</Text>
 <TextInput
 value={companyName}
 onChangeText={setCompanyName}
 placeholder="e.g. Nestara Realty"
 placeholderTextColor="#A1A1AA"
 className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2.5 text-slate-900"
 />
 </View>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-slate-900">Bio (Optional)</Text>
 <TextInput
 value={bio}
 onChangeText={setBio}
 placeholder="Tell us what you are looking for..."
 placeholderTextColor="#A1A1AA"
 multiline
 numberOfLines={3}
 className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-3 text-slate-900 min-h-[80px] text-top"
 />
 </View>
 </View>

 {/* Section 4: Password Setup (For Google Logins) */}
 {needsPassword && (
 <View className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4 shadow-sm">
 <Text className="text-lg font-bold text-blue-900 mb-1">Create Password</Text>
 <Text className="text-xs text-blue-700 mb-2">Since you signed in with Google, please create a password for email login.</Text>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-blue-900">Password</Text>
 <View className="relative">
 <TextInput
 value={password}
 onChangeText={setPassword}
 placeholder="••••••••"
 placeholderTextColor="#A1A1AA"
 secureTextEntry={!showPassword}
 className="w-full bg-white border border-blue-200 rounded-md px-3 py-2.5 pr-10 text-slate-900"
 />
 <Pressable 
 onPress={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-3"
 >
 {/* @ts-ignore */}
 {showPassword ? <EyeOff size={20} color="#A1A1AA" /> : <Eye size={20} color="#A1A1AA" />}
 </Pressable>
 </View>
 </View>

 <View className="space-y-1">
 <Text className="text-sm font-medium text-blue-900">Confirm Password</Text>
 <View className="relative">
 <TextInput
 value={confirmPassword}
 onChangeText={setConfirmPassword}
 placeholder="••••••••"
 placeholderTextColor="#A1A1AA"
 secureTextEntry={!showConfirmPassword}
 className="w-full bg-white border border-blue-200 rounded-md px-3 py-2.5 pr-10 text-slate-900"
 />
 <Pressable 
 onPress={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-3 top-3"
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
 className={`w-full bg-blue-600 rounded-xl py-3.5 items-center justify-center shadow-sm ${loading ? 'opacity-70' : ''}`}
 >
 {loading ? (
 <ActivityIndicator color="white" />
 ) : (
 <Text className="text-white font-bold text-base">Save & Continue</Text>
 )}
 </Pressable>

 <Pressable
 onPress={skipOnboarding}
 className="w-full py-3.5 items-center justify-center border border-slate-200 rounded-xl bg-white"
 >
 <Text className="text-slate-600 font-medium">Skip for now</Text>
 </Pressable>
 </View>

 </View>
 </ScrollView>
 </KeyboardAvoidingView>
 </SafeAreaView>
 );
}
