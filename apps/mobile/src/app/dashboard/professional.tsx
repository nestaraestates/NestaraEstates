import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Briefcase, MapPin, IndianRupee, Link as LinkIcon, Trash2, Plus, LogOut } from 'lucide-react-native';
import * as Linking from 'expo-linking';

export default function ProfessionalDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // fetchDashboard will redirect if not a professional

  
  const [pro, setPro] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Link State
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      const { data: proData, error: proError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (proError) {
        console.error('Error fetching professional profile:', proError);
        setPro(null);
        setLoading(false);
        return;
      }

      const { data: portData, error: portError } = await supabase
        .from('professional_portfolios')
        .select('*')
        .eq('professional_id', user.id);
      if (portError) {
        console.error('Error fetching professional portfolios:', portError);
        setLinks([]);
      }

      const { data: allLeads, error: leadsError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false });
      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        setLeads([]);
      }
        
      // Update UI state only if queries succeeded
      if (!portError && !leadsError) {
        setPro(proData);
        setLinks(portData?.filter((p: any) => p.project_type === 'WEBSITE_LINK') || []);
        const filteredLeads = allLeads?.filter((lead: any) => {
          if (lead.details?.startsWith('DIRECT_REQUEST_FOR:')) {
            return lead.details.startsWith(`DIRECT_REQUEST_FOR:${user.id}`);
          }
          return true;
        }) || [];
        console.log('Fetched professional profile:', proData);
        console.log('Fetched portfolios:', portData);
        console.log('Fetched leads count:', filteredLeads?.length);
        setLeads(filteredLeads);
      }
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addLink() {
    if (!newTitle || !newUrl) {
      Alert.alert("Error", "Please fill in both title and URL.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('professional_portfolios').insert({
        professional_id: user?.id,
        title: newTitle,
        description: newUrl,
        project_type: 'WEBSITE_LINK',
        media_urls: [newUrl]
      });
      if (error) throw error;
      setNewTitle('');
      setNewUrl('');
      await fetchDashboard();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to add link");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteLink(id: string) {
    try {
      await supabase.from('professional_portfolios').delete().eq('id', id);
      await fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Stack.Screen options={{ title: 'Pro Dashboard' }} />
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!pro) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center p-6" style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ title: 'Pro Dashboard' }} />
        <Text className="text-xl font-bold text-zinc-900 mb-2">Not a Professional</Text>
        <Text className="text-center text-zinc-500 mb-6">You need to register as a professional on the web platform to access this dashboard.</Text>
        <Pressable onPress={() => router.push('/join-professional')} className="bg-brand-600 px-6 py-3 rounded-lg mt-4">
          <Text className="text-white font-bold">Join Professional</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ title: 'Pro Dashboard' }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
        
        {/* Profile Summary */}
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 mb-6">
          <Text className="text-xl font-bold text-zinc-900 mb-1">{pro.company_name}</Text>
          <Text className="text-zinc-500 mb-4">{pro.category}</Text>
          <View className="flex-row items-center justify-between pt-4 border-t border-zinc-100">
            <View className="flex-row items-center">
              <MapPin size={16} color="#71717A" />
              <Text className="text-zinc-600 font-medium ml-1">Radius: {pro.service_radius_km}km</Text>
            </View>
            <View className="flex-row items-center">
              <IndianRupee size={16} color="#71717A" />
              <Text className="text-zinc-600 font-medium ml-1">Base: {pro.base_price_amount}</Text>
            </View>
          </View>
        </View>

        {/* Website Links */}
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 mb-6">
          <Text className="text-lg font-bold text-zinc-900 mb-1">External Links</Text>
          <Text className="text-xs text-zinc-500 mb-4">Manage links to your website or portfolio</Text>
          
          {links.length > 0 ? (
            <View className="space-y-3 mb-6">
              {links.map((link) => (
                <View key={link.id} className="flex-row items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl p-3 mb-2">
                  <View className="flex-row items-center flex-1 mr-4">
                    <LinkIcon size={16} color="#0284c7" />
                    <View className="ml-3 flex-1">
                      <Text className="font-bold text-zinc-900 text-sm">{link.title}</Text>
                      <Text className="text-xs text-blue-500 truncate" numberOfLines={1}>{link.description}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => deleteLink(link.id)} className="p-2">
                    <Trash2 size={16} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-zinc-500 mb-6 italic">No links added yet.</Text>
          )}

          <View className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <Text className="text-sm font-bold text-zinc-900 mb-3">Add New Link</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Title (e.g. Website, Instagram)"
              className="bg-white border border-zinc-200 p-3 rounded-lg text-zinc-900 mb-3 text-sm"
            />
            <TextInput
              value={newUrl}
              onChangeText={setNewUrl}
              placeholder="URL (https://...)"
              autoCapitalize="none"
              keyboardType="url"
              className="bg-white border border-zinc-200 p-3 rounded-lg text-zinc-900 mb-4 text-sm"
            />
            <Pressable 
              disabled={isSubmitting}
              onPress={addLink}
              className={`flex-row items-center justify-center py-3 rounded-lg ${isSubmitting ? 'bg-brand-400' : 'bg-brand-600'}`}
            >
              <Plus size={16} color="white" className="mr-2" />
              <Text className="text-white font-bold">Add Link</Text>
            </Pressable>
          </View>
        </View>

        {/* Active Leads */}
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 mb-6">
          <Text className="text-lg font-bold text-zinc-900 mb-4">Active Leads ({leads.length})</Text>
          {leads.length > 0 ? (
            leads.map((lead) => {
              const isDirect = lead.details?.startsWith('DIRECT_REQUEST_FOR:');
              const displayDetails = isDirect ? lead.details.split('|').slice(1).join('|').trim() : lead.details;
              
              return (
                <View key={lead.id} className={`p-4 rounded-xl border mb-3 ${isDirect ? 'bg-amber-50 border-amber-200' : 'bg-zinc-50 border-zinc-200'}`}>
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="font-bold text-zinc-900">{lead.service_category}</Text>
                      {isDirect && (
                        <View className="bg-amber-200 px-2 py-0.5 rounded mt-1 self-start">
                          <Text className="text-[10px] font-bold text-amber-800 uppercase">Direct Request</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">Open</Text>
                  </View>
                  <Text className="text-sm text-zinc-600 mb-3 line-clamp-2">{displayDetails}</Text>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <MapPin size={12} color="#71717A" />
                      <Text className="text-xs text-zinc-500 font-medium">{lead.location_data?.city || 'Anywhere'}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <IndianRupee size={12} color="#71717A" />
                      <Text className="text-xs text-zinc-500 font-medium">{lead.budget_approx || 'Flexible'}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text className="text-zinc-500 text-sm">No active leads at the moment.</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
