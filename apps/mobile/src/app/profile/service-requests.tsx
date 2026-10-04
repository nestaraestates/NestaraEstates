import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit2, Calendar, MapPin, HardHat, FileText, IndianRupee } from 'lucide-react-native';

export default function MyServiceRequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setRequests(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    Alert.alert(
      "Delete Request",
      "Are you sure you want to delete this service request? Professionals will no longer be able to see it or send quotes.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.from('service_requests').delete().eq('id', id);
            if (!error) {
              setRequests(prev => prev.filter(req => req.id !== id));
            } else {
              Alert.alert('Error', 'Could not delete request.');
            }
          }
        }
      ]
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-1">
            <HardHat size={16} color="#0284c7" className="mr-1.5" />
            <Text className="font-bold text-zinc-900 text-lg">{item.service_category}</Text>
          </View>
          <Text className="text-xs font-bold text-brand-600 bg-brand-50 self-start px-2 py-0.5 rounded uppercase tracking-wider mb-2">
            Status: {item.status}
          </Text>
        </View>
        <Pressable onPress={() => handleDelete(item.id)} className="p-2 bg-red-50 rounded-full">
          <Trash2 size={18} color="#ef4444" />
        </Pressable>
      </View>
      
      <View className="flex-row items-center mb-2">
        <MapPin size={14} color="#71717A" className="mr-2" />
        <Text className="text-sm text-zinc-600">{item.location_data?.city || 'Location not specified'}</Text>
      </View>

      <View className="flex-row items-center mb-2">
        <IndianRupee size={14} color="#71717A" className="mr-2" />
        <Text className="text-sm text-zinc-600">Budget Approx: ₹{item.budget_approx}</Text>
      </View>

      <View className="flex-row items-center mb-3">
        <Calendar size={14} color="#71717A" className="mr-2" />
        <Text className="text-sm text-zinc-600">Starts: {item.location_data?.start_date || 'N/A'}</Text>
      </View>

      <View className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
        <View className="flex-row items-center mb-1">
          <FileText size={14} color="#52525B" className="mr-1.5" />
          <Text className="text-xs font-bold text-zinc-700">Details</Text>
        </View>
        <Text className="text-sm text-zinc-600 leading-5">{item.details}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ title: 'My Service Requests', headerTitleStyle: { fontWeight: 'bold' } }} />
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20 px-6">
              <HardHat size={48} color="#D4D4D8" className="mb-4" />
              <Text className="text-xl font-bold text-zinc-900 mb-2">No Requests Yet</Text>
              <Text className="text-center text-zinc-500 mb-6">
                You haven't submitted any home building or professional service requests yet.
              </Text>
              <Pressable 
                onPress={() => router.push('/build-your-home' as any)}
                className="bg-brand-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-bold">Start a Project</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
