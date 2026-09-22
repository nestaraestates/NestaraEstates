import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { ArrowLeft } from 'lucide-react-native';

export default function EditPropertyScreen() {
 const { id } = useLocalSearchParams();
 const router = useRouter();
 
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [errorMsg, setErrorMsg] = useState('');
 
 const [formData, setFormData] = useState({
 title: '',
 price: '',
 status: 'AVAILABLE',
 description: ''
 });

 useEffect(() => {
 fetchProperty();
 }, [id]);

 const fetchProperty = async () => {
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 Alert.alert('Error', 'You must be logged in.');
 router.back();
 return;
 }

 const { data, error } = await supabase
 .from('properties')
 .select('*')
 .eq('id', id)
 .single();

 if (error || !data) {
 throw new Error('Property not found.');
 }

 if (data.owner_id !== user.id) {
 throw new Error('You do not have permission to edit this property.');
 }

 setFormData({
 title: data.title || '',
 price: data.price?.toString() || '',
 status: data.status || 'AVAILABLE',
 description: data.description || ''
 });
 } catch (err: any) {
 Alert.alert('Error', err.message);
 router.back();
 } finally {
 setIsLoading(false);
 }
 };

 const updateForm = (key: keyof typeof formData, value: string) => {
 setFormData(prev => ({ ...prev, [key]: value }));
 };

 const saveChanges = async () => {
 setIsSaving(true);
 setErrorMsg('');

 try {
 const { error } = await supabase
 .from('properties')
 .update({
 title: formData.title,
 price: parseFloat(formData.price) || 0,
 status: formData.status,
 description: formData.description
 })
 .eq('id', id);

 if (error) throw error;

 Alert.alert('Success', 'Property updated successfully!');
 router.back();
 } catch (err: any) {
 setErrorMsg(err.message || 'Failed to update property.');
 } finally {
 setIsSaving(false);
 }
 };

 if (isLoading) {
 return (
 <View className="flex-1 bg-slate-50 items-center justify-center">
 <ActivityIndicator size="large" color="#3b82f6" />
 </View>
 );
 }

 return (
 <SafeAreaView className="flex-1 bg-slate-50">
 <View className="flex-row items-center px-4 py-3 border-b border-slate-200">
 <Pressable onPress={() => router.push('/profile/properties' as any)} className="mr-3">
 <ArrowLeft size={24} className="text-slate-900" />
 </Pressable>
 <Text className="text-xl font-bold text-slate-900">Edit Listing</Text>
 </View>

 <ScrollView className="flex-1 p-4">
 {errorMsg ? (
 <View className="bg-red-50 p-3 rounded-md mb-4 border border-red-200">
 <Text className="text-red-600 text-sm">{errorMsg}</Text>
 </View>
 ) : null}

 <View className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
 <View>
 <Text className="text-sm font-medium text-slate-900 mb-1">Property Title</Text>
 <TextInput 
 className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900"
 value={formData.title}
 onChangeText={(t) => updateForm('title', t)}
 />
 </View>

 <View>
 <Text className="text-sm font-medium text-slate-900 mb-1">Price (₹)</Text>
 <TextInput 
 className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900"
 keyboardType="numeric"
 value={formData.price}
 onChangeText={(t) => updateForm('price', t)}
 />
 </View>

 <View>
 <Text className="text-sm font-medium text-slate-900 mb-1">Status</Text>
 <View className="flex-row flex-wrap">
 {['AVAILABLE', 'SOLD', 'RENTED', 'UNAVAILABLE'].map((s) => (
 <Pressable
 key={s}
 onPress={() => updateForm('status', s)}
 className={`px-3 py-2 rounded-full border mr-2 mb-2 ${
 formData.status === s 
 ? 'bg-blue-100 border-blue-500 '
 : 'bg-slate-50 border-slate-200'
 }`}
 >
 <Text className={formData.status === s ? 'text-blue-700 font-medium' : 'text-slate-600'}>
 {s}
 </Text>
 </Pressable>
 ))}
 </View>
 </View>

 <View>
 <Text className="text-sm font-medium text-slate-900 mb-1">Property Description</Text>
 <TextInput 
 className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 min-h-[120px]"
 multiline
 textAlignVertical="top"
 value={formData.description}
 onChangeText={(t) => updateForm('description', t)}
 />
 </View>

 <Pressable 
 className="w-full py-3 mt-4 rounded-md items-center bg-blue-500"
 onPress={saveChanges}
 disabled={isSaving}
 >
 {isSaving ? (
 <ActivityIndicator color="#FFF" size="small" />
 ) : (
 <Text className="font-medium text-white text-base">Save Changes</Text>
 )}
 </Pressable>
 </View>
 <View className="h-8" />
 </ScrollView>
 </SafeAreaView>
 );
}
