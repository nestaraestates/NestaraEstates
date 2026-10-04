import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, Pressable, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Briefcase, MapPin, Star, ShieldCheck, IndianRupee, X, Send, Link as LinkIcon, ExternalLink } from 'lucide-react-native';
import * as Linking from 'expo-linking';

export default function ProfessionalProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [pro, setPro] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [serviceCategory, setServiceCategory] = useState('WORKER');
  const [budget, setBudget] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const { data: proData } = await supabase
        .from('professional_profiles')
        .select('*, profiles:id (full_name, avatar_url)')
        .eq('id', id)
        .single();
        
      const { data: portData } = await supabase
        .from('professional_portfolios')
        .select('*')
        .eq('professional_id', id);
        
      setPro(proData);
      setPortfolio(portData?.filter((p: any) => p.project_type !== 'WEBSITE_LINK') || []);
      setLinks(portData?.filter((p: any) => p.project_type === 'WEBSITE_LINK') || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function submitRequest() {
    if (!budget || !details) {
      alert("Please fill out budget and details.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to send a request.");
        setIsSubmitting(false);
        return;
      }
      
      const targetedDetails = `DIRECT_REQUEST_FOR:${pro.id} | ${details}`;
      
      const { error } = await supabase.from('service_requests').insert({
        customer_id: user.id,
        service_category: serviceCategory,
        budget_approx: parseFloat(budget),
        details: targetedDetails,
        status: 'OPEN'
      });
      
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        setShowQuoteModal(false);
        setSuccess(false);
      }, 2000);
      
    } catch (error: any) {
      alert(error.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!pro) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text className="text-zinc-500">Professional not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-50">
      <Stack.Screen options={{ title: pro.company_name, headerTitleStyle: { fontWeight: 'bold' } }} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Header Profile Section */}
        <View className="bg-white px-6 pt-8 pb-6 border-b border-zinc-200">
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-2xl bg-zinc-100 overflow-hidden border-4 border-white shadow-sm mb-4 items-center justify-center">
              {pro.profiles?.avatar_url ? (
                <Image source={{ uri: pro.profiles.avatar_url }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Briefcase size={32} color="#A1A1AA" />
              )}
            </View>
            <View className="flex-row items-center justify-center mb-1 gap-2">
              <Text className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded uppercase">{pro.sub_category || pro.category}</Text>
              {pro.verification_level >= 3 && (
                <View className="flex-row items-center bg-emerald-50 px-2 py-0.5 rounded">
                  <ShieldCheck size={12} color="#059669" />
                  <Text className="text-[10px] font-bold text-emerald-700 ml-1">VERIFIED</Text>
                </View>
              )}
            </View>
            <Text className="text-2xl font-bold text-zinc-900 text-center mb-1">{pro.company_name}</Text>
            <Text className="text-sm text-zinc-500">Operated by {pro.profiles?.full_name}</Text>
          </View>

          <View className="flex-row justify-between border-t border-zinc-100 pt-6 mt-2">
            <View className="items-center flex-1">
              <Text className="text-lg font-bold text-zinc-900 flex-row items-center">
                 <Star size={16} color="#FBBF24" fill="#FBBF24" /> {pro.average_rating || 'New'}
              </Text>
              <Text className="text-xs text-zinc-500 mt-1">{pro.total_reviews || 0} Reviews</Text>
            </View>
            <View className="items-center flex-1 border-l border-zinc-100">
              <Text className="text-lg font-bold text-zinc-900">{pro.years_experience}</Text>
              <Text className="text-xs text-zinc-500 mt-1">Years Exp.</Text>
            </View>
          </View>

          {links.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-6 pt-6 border-t border-zinc-100 px-2">
              {links.map((link: any) => (
                <Pressable key={link.id} onPress={() => Linking.openURL(link.description)} className="flex-row items-center bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm mr-2 mb-2">
                  <LinkIcon size={14} color="#0284c7" />
                  <Text className="text-sm font-bold text-zinc-900 ml-2 mr-1">{link.title}</Text>
                  <ExternalLink size={12} color="#A1A1AA" />
                </Pressable>
              ))}
            </View>
          )}
        </View>


        {/* Stats */}
        <View className="flex-row p-4 gap-4">
          <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
            <MapPin size={20} color="#f59e0b" className="mb-2" />
            <Text className="text-xs font-medium text-zinc-500 mb-1">Service Radius</Text>
            <Text className="text-sm font-bold text-zinc-900">{pro.service_radius_km} km</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
            <IndianRupee size={20} color="#f59e0b" className="mb-2" />
            <Text className="text-xs font-medium text-zinc-500 mb-1">Pricing Base</Text>
            <Text className="text-sm font-bold text-zinc-900">₹{pro.base_price_amount}</Text>
          </View>
        </View>

        {/* Portfolio */}
        <View className="px-4 mt-2">
          <Text className="text-lg font-bold text-zinc-900 mb-4 px-2">Portfolio</Text>
          {portfolio.length === 0 ? (
            <View className="bg-white p-6 rounded-2xl items-center border border-zinc-100">
              <Text className="text-zinc-500 text-sm">No portfolio items yet.</Text>
            </View>
          ) : (
            portfolio.map(item => (
              <View key={item.id} className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm border border-zinc-100">
                <Image source={{ uri: item.media_urls[0] }} className="w-full h-48 bg-zinc-200" resizeMode="cover" />
                <View className="p-4">
                  <Text className="font-bold text-zinc-900">{item.title}</Text>
                  <Text className="text-xs text-zinc-500 mt-1">{item.project_type}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <Pressable 
          onPress={() => setShowQuoteModal(true)}
          className="bg-brand-600 flex-row items-center justify-center py-4 rounded-2xl shadow-sm"
        >
          <Send size={18} color="white" className="mr-2" />
          <Text className="text-white font-bold text-base">Request Direct Quote</Text>
        </Pressable>
      </View>

      {/* Request Quote Modal */}
      <Modal visible={showQuoteModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-zinc-900">Request Quote</Text>
              <Pressable onPress={() => setShowQuoteModal(false)}>
                <X size={24} color="#71717A" />
              </Pressable>
            </View>

            {success ? (
              <View className="py-8 items-center">
                <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
                  <Send size={32} color="#059669" />
                </View>
                <Text className="text-xl font-bold text-zinc-900 mb-2">Request Sent!</Text>
                <Text className="text-center text-zinc-500">{pro.company_name} will get back to you soon.</Text>
              </View>
            ) : (
              <View>
                <Text className="text-sm font-semibold text-zinc-900 mb-2">Service Needed</Text>
                <View className="border border-zinc-200 rounded-xl mb-4 px-4 py-3 bg-zinc-50">
                  <Text className="text-zinc-900 font-medium">{serviceCategory}</Text>
                </View>

                <Text className="text-sm font-semibold text-zinc-900 mb-2">Approximate Budget (₹)</Text>
                <TextInput
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                  placeholder="e.g. 50000"
                  className="border border-zinc-200 rounded-xl mb-4 px-4 py-3 bg-zinc-50 text-zinc-900"
                />

                <Text className="text-sm font-semibold text-zinc-900 mb-2">Project Details</Text>
                <TextInput
                  value={details}
                  onChangeText={setDetails}
                  multiline
                  numberOfLines={4}
                  placeholder="Describe your project, timeline..."
                  className="border border-zinc-200 rounded-xl mb-6 px-4 py-3 bg-zinc-50 text-zinc-900 h-24 text-top"
                  style={{ textAlignVertical: 'top' }}
                />

                <Pressable 
                  disabled={isSubmitting}
                  onPress={submitRequest}
                  className={`py-4 rounded-xl items-center justify-center ${isSubmitting ? 'bg-brand-400' : 'bg-brand-600'}`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-base">Send Request</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
