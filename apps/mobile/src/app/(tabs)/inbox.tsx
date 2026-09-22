import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { MessageSquare, ShoppingBag, Store, ChevronRight, Clock } from 'lucide-react-native';

export default function InboxScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buyerEnquiries, setBuyerEnquiries] = useState<any[]>([]);
  const [sellerLeads, setSellerLeads] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchInbox();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInbox();
    setRefreshing(false);
  };

  const fetchInbox = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }
    setUserId(session.user.id);

    // Fetch Buyer Enquiries
    const { data: buyerData } = await supabase
      .from('enquiries')
      .select('id, message, status, created_at, properties(id, title, location, city)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    // Fetch Seller Leads
    const { data: sellerData } = await supabase
      .from('enquiries')
      .select('id, message, status, created_at, name, phone, properties!inner(id, title)')
      .eq('properties.owner_id', session.user.id)
      .order('created_at', { ascending: false });

    setBuyerEnquiries(buyerData || []);
    setSellerLeads(sellerData || []);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 bg-white border-b border-slate-200 flex-row items-center">
        <Image source={require('@/assets/images/logo-sm.png')} className="w-12 h-12 mr-3 rounded-xl" resizeMode="contain" />
        <View>
          <Text className="text-2xl font-black text-slate-900 tracking-tight">Messages Hub</Text>
          <Text className="text-slate-500 font-medium">Manage all your communications</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row p-4 space-x-4">
        <Pressable 
          onPress={() => setActiveTab('buyer')}
          className={`flex-1 flex-row items-center justify-center p-3 rounded-xl border-2 ${activeTab === 'buyer' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}
        >
          <ShoppingBag size={20} color={activeTab === 'buyer' ? '#047857' : '#64748b'} />
          <Text className={`ml-2 font-bold ${activeTab === 'buyer' ? 'text-emerald-700' : 'text-slate-500'}`}>Buyer Inbox</Text>
        </Pressable>
        <Pressable 
          onPress={() => setActiveTab('seller')}
          className={`flex-1 flex-row items-center justify-center p-3 rounded-xl border-2 ${activeTab === 'seller' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}
        >
          <Store size={20} color={activeTab === 'seller' ? '#b45309' : '#64748b'} />
          <Text className={`ml-2 font-bold ${activeTab === 'seller' ? 'text-amber-700' : 'text-slate-500'}`}>Seller Inbox</Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-4" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" colors={['#f59e0b']} />
          }
        >
          {activeTab === 'buyer' ? (
            buyerEnquiries.length === 0 ? (
              <View className="items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed mt-4">
                <MessageSquare size={48} color="#cbd5e1" />
                <Text className="text-slate-500 font-medium mt-4">You haven't enquired about any properties yet.</Text>
              </View>
            ) : (
              buyerEnquiries.map((enq) => (
                <Pressable 
                  key={enq.id}
                  onPress={() => router.push(`/chat/buyer/${enq.id}`)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 mb-4 flex-row items-center"
                >
                  <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center mr-4">
                    <ShoppingBag size={24} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-slate-900 mb-1" numberOfLines={1}>{enq.properties?.title}</Text>
                    <Text className="text-slate-500 text-sm" numberOfLines={1}>{enq.message || "I am interested in this property."}</Text>
                    <View className="flex-row items-center mt-2">
                      <Clock size={12} color="#94a3b8" />
                      <Text className="text-xs text-slate-400 ml-1">{formatDate(enq.created_at)}</Text>
                      <View className={`ml-3 px-2 py-0.5 rounded-full ${enq.status === 'PENDING' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        <Text className={`text-[10px] font-bold ${enq.status === 'PENDING' ? 'text-blue-700' : 'text-slate-600'}`}>{enq.status}</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#cbd5e1" />
                </Pressable>
              ))
            )
          ) : (
            sellerLeads.length === 0 ? (
              <View className="items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed mt-4">
                <MessageSquare size={48} color="#cbd5e1" />
                <Text className="text-slate-500 font-medium mt-4">No enquiries on your properties yet.</Text>
              </View>
            ) : (
              sellerLeads.map((enq) => (
                <Pressable 
                  key={enq.id}
                  onPress={() => router.push(`/chat/seller/${enq.id}`)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 mb-4 flex-row items-center"
                >
                  <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center mr-4">
                    <Store size={24} color="#d97706" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-bold text-slate-900" numberOfLines={1}>{enq.name}</Text>
                    </View>
                    <Text className="text-amber-600 text-xs font-semibold mb-1" numberOfLines={1}>{enq.properties?.title}</Text>
                    <Text className="text-slate-500 text-sm" numberOfLines={1}>{enq.message || "Wants more details."}</Text>
                    <View className="flex-row items-center mt-2">
                      <Clock size={12} color="#94a3b8" />
                      <Text className="text-xs text-slate-400 ml-1">{formatDate(enq.created_at)}</Text>
                      <View className={`ml-3 px-2 py-0.5 rounded-full ${enq.status === 'PENDING' ? 'bg-amber-100' : 'bg-slate-100'}`}>
                        <Text className={`text-[10px] font-bold ${enq.status === 'PENDING' ? 'text-amber-700' : 'text-slate-600'}`}>{enq.status}</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#cbd5e1" />
                </Pressable>
              ))
            )
          )}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
