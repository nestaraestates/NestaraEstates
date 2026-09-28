import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, BellRing, CheckCircle2, MessageSquare, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function NotificationsScreen() {
 const router = useRouter();
 const [notifications, setNotifications] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);

 const fetchNotifications = async () => {
 try {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) return;

 const { data } = await supabase
 .from('notifications')
 .select('*')
 .eq('user_id', session.user.id)
 .order('created_at', { ascending: false });

 if (data) {
 setNotifications(data);
 
 // Mark as read
 const unreadIds = data.filter(n => !n.is_read).map(n => n.id);
 if (unreadIds.length > 0) {
 await supabase
 .from('notifications')
 .update({ is_read: true })
 .in('id', unreadIds);
 }
 }
 } catch (error) {
 console.error(error);
 } finally {
 setLoading(false);
 setRefreshing(false);
 }
 };

 useEffect(() => {
 fetchNotifications();
 }, []);

 const onRefresh = () => {
 setRefreshing(true);
 fetchNotifications();
 };

 const clearAll = async () => {
 const { data: { session } } = await supabase.auth.getSession();
 if (session) {
 await supabase.from('notifications').delete().eq('user_id', session.user.id);
 setNotifications([]);
 }
 };

 return (
 <SafeAreaView className="flex-1 bg-slate-50 dark:bg-zinc-950">
 <View className="flex-row items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
 <View className="flex-row items-center">
 <Pressable onPress={() => router.push('/' as any)} className="p-2 mr-2">
 {/* @ts-ignore */}
 <ArrowLeft size={24} color="#52525b" />
 </Pressable>
 <Text className="text-xl font-bold text-slate-900 dark:text-zinc-50">Notifications</Text>
 </View>
 {notifications.length > 0 && (
 <Pressable onPress={clearAll} className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
 {/* @ts-ignore */}
 <Trash2 size={16} color="#ef4444" />
 <Text className="text-red-500 font-semibold ml-1 text-sm">Clear</Text>
 </Pressable>
 )}
 </View>

 <ScrollView 
 className="flex-1 p-4"
 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
 >
 {loading ? (
 <ActivityIndicator size="large" color="#3b82f6" className="mt-10" />
 ) : notifications.length === 0 ? (
 <View className="items-center justify-center py-20 mt-10">
 <View className="bg-slate-100 dark:bg-zinc-800 p-6 rounded-full mb-4">
 {/* @ts-ignore */}
 <BellRing size={48} color="#d4d4d8" />
 </View>
 <Text className="text-xl font-bold text-slate-900 dark:text-zinc-50 mb-2">You're all caught up!</Text>
 <Text className="text-slate-500 dark:text-zinc-400 text-center">There are no new notifications for your account.</Text>
 </View>
 ) : (
 <View className="space-y-3 pb-10">
 {notifications.map((notif) => (
 <View 
 key={notif.id} 
 className={`p-4 rounded-2xl border mb-3 ${notif.is_read ? 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800' : 'bg-blue-50 border-blue-200'}`}
 >
 <View className="flex-row items-start">
 <View className={`p-2 rounded-full mr-3 mt-1 ${notif.title?.includes('Message') ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
 {notif.title?.includes('Message') ? (
 // @ts-ignore
 <MessageSquare size={20} color="#3b82f6" />
 ) : (
 // @ts-ignore
 <CheckCircle2 size={20} color="#10b981" />
 )}
 </View>
 <View className="flex-1">
 <View className="flex-row justify-between items-start mb-1">
 <Text className={`text-base font-bold flex-1 mr-2 ${notif.is_read ? 'text-slate-900 dark:text-zinc-50' : 'text-blue-900'}`}>
 {notif.title}
 </Text>
 <Text className="text-xs font-medium text-slate-400 dark:text-zinc-500">
 {new Date(notif.created_at).toLocaleDateString()}
 </Text>
 </View>
 <Text className={`text-sm ${notif.is_read ? 'text-slate-600 dark:text-zinc-300' : 'text-slate-800 dark:text-zinc-100'}`}>
 {notif.content}
 </Text>
 </View>
 </View>
 </View>
 ))}
 </View>
 )}
 </ScrollView>
 </SafeAreaView>
 );
}
