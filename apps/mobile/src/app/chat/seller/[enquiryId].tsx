import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Send, ChevronLeft, Store } from 'lucide-react-native';

export default function SellerChatScreen() {
 const { enquiryId } = useLocalSearchParams();
 const router = useRouter();
 
 const [messages, setMessages] = useState<any[]>([]);
 const [inputText, setInputText] = useState('');
 const [isSending, setIsSending] = useState(false);
 const [loading, setLoading] = useState(true);
 
 const [userId, setUserId] = useState<string | null>(null);
 const flatListRef = useRef<FlatList>(null);

 useEffect(() => {
 setupUserAndMessages();
 }, [enquiryId]);

 const setupUserAndMessages = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 router.replace('/(auth)/login');
 return;
 }
 setUserId(user.id);

 if (enquiryId) {
 const { data } = await supabase
 .from('messages')
 .select('*')
 .eq('enquiry_id', enquiryId)
 .order('created_at', { ascending: true });
 
 if (data) {
 setMessages(data);
 }

 const channel = supabase
 .channel(`seller_chat_${enquiryId}_${Math.random()}`)
 .on('postgres_changes', { 
 event: 'INSERT', 
 schema: 'public', 
 table: 'messages',
 filter: `enquiry_id=eq.${enquiryId}`
 }, payload => {
 setMessages(prev => {
 if (prev.some(m => m.id === payload.new.id)) return prev;
 
 const hasOptimistic = prev.some(m => m.id.toString().startsWith('temp-') && m.message === payload.new.message);
 
 if (hasOptimistic) {
 let replaced = false;
 return prev.map(m => {
 if (!replaced && m.id.toString().startsWith('temp-') && m.message === payload.new.message) {
 replaced = true;
 return payload.new;
 }
 return m;
 });
 }
 
 return [...prev, payload.new];
 });
 })
 .subscribe();
 
 setLoading(false);
 return () => { supabase.removeChannel(channel) };
 }
 };

 const handleSend = async () => {
 if (!inputText.trim() || isSending || !userId) return;

 const messageText = inputText.trim();
 setInputText('');
 setIsSending(true);

 const tempId = `temp-${Date.now()}`;
 
 // Find Admin ID
 const { data: adminProfiles } = await supabase
 .from('profiles')
 .select('id')
 .eq('role', 'ADMIN')
 .limit(1);
 
 const adminId = adminProfiles?.[0]?.id || 'ff46b994-2502-4435-aca5-ce8e44be0ddc';

 const newMessage = {
 id: tempId,
 enquiry_id: enquiryId as string,
 sender_id: userId,
 receiver_id: adminId,
 message: messageText,
 created_at: new Date().toISOString(),
 };

 setMessages(prev => [...prev, newMessage]);
 
 // Scroll to bottom
 setTimeout(() => {
 flatListRef.current?.scrollToEnd({ animated: true });
 }, 100);

 try {
 // Insert message
 const { error: msgError } = await supabase.from('messages').insert({
 enquiry_id: enquiryId as string,
 sender_id: userId,
 receiver_id: adminId,
 message: messageText
 });

 if (msgError) throw msgError;

 if (adminId) {
 await supabase.from('notifications').insert({
 user_id: adminId,
 title: 'New Message from Seller',
 content: 'A seller sent you a direct message regarding their property.',
 link: `/admin/properties/${enquiryId}/seller-chat`,
 is_read: false
 });
 }
 } catch (error) {
 console.error(error);
 setMessages(prev => prev.filter(m => m.id !== tempId));
 alert('Failed to send message.');
 } finally {
 setIsSending(false);
 }
 };

 const renderMessage = ({ item }: { item: any }) => {
 const isMe = item.sender_id === userId;
 return (
 <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
 <View className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-blue-600 rounded-tr-sm' : 'bg-white border border-slate-200 rounded-tl-sm'}`}>
 <Text className={`text-base ${isMe ? 'text-white' : 'text-slate-900'}`}>{item.message}</Text>
 </View>
 </View>
 );
 };

 return (
 <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
 <Stack.Screen options={{ headerShown: false }} />
 
 <View className="flex-row items-center p-4 bg-blue-600">
 <TouchableOpacity onPress={() => router.push('/inbox' as any)} className="mr-3">
 <ChevronLeft size={24} color="white" />
 </TouchableOpacity>
 <Store size={20} color="white" className="mr-2" />
 <View>
 <Text className="text-white font-bold text-lg">Seller Support</Text>
 <Text className="text-blue-100 text-xs">Direct agent chat for this property</Text>
 </View>
 </View>

 {loading ? (
 <View className="flex-1 justify-center items-center">
 <ActivityIndicator size="large" color="#2563eb" />
 </View>
 ) : (
 <KeyboardAvoidingView 
 style={{ flex: 1 }} 
 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
 keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
 >
 <FlatList
 ref={flatListRef}
 data={messages}
 keyExtractor={(item) => item.id.toString()}
 renderItem={renderMessage}
 contentContainerStyle={{ padding: 16, flexGrow: 1 }}
 onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
 onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
 ListEmptyComponent={
 <View className="flex-1 justify-center items-center mt-10">
 <Text className="text-slate-400 text-center text-sm">
 You are connected with Nestara support.
 </Text>
 </View>
 }
 />

 <View className="p-3 bg-white border-t border-slate-200 flex-row items-center pb-8">
 <TextInput
 className="flex-1 bg-slate-100 px-4 py-3 rounded-full mr-2 text-slate-900"
 placeholder="Type your message..."
 placeholderTextColor="#9ca3af"
 value={inputText}
 onChangeText={setInputText}
 multiline
 />
 <TouchableOpacity 
 onPress={handleSend}
 disabled={!inputText.trim() || isSending}
 className={`p-3 rounded-full ${(!inputText.trim() || isSending) ? 'bg-blue-300' : 'bg-blue-600'}`}
 >
 <Send size={20} color="white" />
 </TouchableOpacity>
 </View>
 </KeyboardAvoidingView>
 )}
 </SafeAreaView>
 );
}
